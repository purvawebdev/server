import { Chat } from "../models/Chat.js";
import { searchContext } from "../utils/vectorStore.js";
import { queryGeminiStream } from "../utils/gemini.js";

export const handleChat = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let chat;

    const chatTitle = message.length > 30 ? message.substring(0,30) + "..." : message;

    // --- STEP 1: Determine if New or Existing Chat ---
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: userId });
      
      if (!chat) {
        return res.status(404).json({error:"Chat thread not found"});
      }
    } else {
      chat = await Chat.create({
        userId: userId,
        title: chatTitle,
        messages: []
      });
    }

    // --- STEP 2: Save User Message ---
    chat.messages.push({
      role: "user",
      content: message
    });
    await chat.save();

    // --- STEP 3: RAG & AI Logic ---
    let context = "";
    try {
      const docs = await searchContext(message, 3);
      context = docs.filter(d => d.text).map(d => d.text).join("\n\n");
    } catch (err) {
      console.log("Context search warning:", err.message);
      // Continue without context if search fails
      context = "";
    }
const chatHistory = chat.messages.slice(0,-1);


    // --- STEP 4: Stream Response ---
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering
    
    if (res.flushHeaders) res.flushHeaders();

    console.log("Starting stream for message:", message);
    let fullAnswer = "";

    // Stream from Gemini
    await queryGeminiStream(message,chatHistory, context, (chunk) => {
      fullAnswer += chunk;
      console.log("Sending chunk to client:", chunk.substring(0, 30) + "...");
      res.write(`data: ${JSON.stringify({ chunk, chatId: chat._id })}\n\n`);
      if (res.flush) res.flush(); // Flush if available
    });

    console.log("Stream completed, full answer length:", fullAnswer.length);

    // --- STEP 5: Send Final Message (DO THIS FIRST) ---
    // Tell the frontend immediately that the stream is done
    res.write(`data: ${JSON.stringify({ done: true, chatId: chat._id })}\n\n`);
    res.end();

    // --- STEP 6: Save Full Response to DB (DO THIS LAST) ---
    chat.messages.push({
      role: "assistant",
      content: fullAnswer
    });
    
    // Notice we REMOVED the "await" keyword. 
    // This is a "Fire-and-Forget" operation. The server saves it in the background.
    chat.save().catch(dbErr => console.error("Failed to save AI response to DB:", dbErr));

  } catch (err) { 
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
    }
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};

export const getAllChats = async (req, res, next) => {
  try{
    const userId = req.user._id;
    const chats = await Chat.find({userId: userId}).sort({updatedAt:-1}).select("_id title updatedAt");
    res.status(200).json(chats);
  }catch(err){
    next(err);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to view this chat" });
    }

    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const createNewChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.create({
      userId: userId,
      title: "New Chat",
      messages: []
    });

    res.status(201).json({ chatId: chat._id });
  } catch (err) {
    next(err);
  }
};