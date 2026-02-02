import { Chat } from "../models/Chat.js";
import { searchContext } from "../utils/vectorStore.js";
import { queryGemini } from "../utils/gemini.js";

export const handleChat = async (req, res, next) => {
  try {
    const { message, chatId } = req.body; // <--- Now we accept chatId too!
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let chat;

    // --- STEP 1: Determine if New or Existing Chat ---
    if (chatId) {
      // CASE A: User wants to continue a specific conversation
      chat = await Chat.findOne({ _id: chatId, userId: userId });
      
      // If chatId was invalid/deleted, we can either error out or start new.
      // Let's start new to be safe.
      if (!chat) {
        chat = await Chat.create({
          userId: userId,
          title: message.substring(0, 30) + "...", // Use first 30 chars as title
          messages: []
        });
      }
    } else {
      // CASE B: No chatId provided -> Start a BRAND NEW Thread
      chat = await Chat.create({
        userId: userId,
        title: message.substring(0, 30) + "...", // Auto-generate title from first message
        messages: []
      });
    }

    // --- STEP 2: Save User Message ---
    chat.messages.push({
      role: "user",
      content: message
    });

    // --- STEP 3: RAG & AI Logic ---
    const docs = await searchContext(message, 3);
    const context = docs.map(d => d.text).join("\n\n");
    const answer = await queryGemini(message, context);

    // --- STEP 4: Save AI Response ---
    chat.messages.push({
      role: "assistant",
      content: answer
    });

    await chat.save();

    // Return the complete updated chat, not just the response
    res.json({ 
      chat: chat,
      chatId: chat._id 
    });

  } catch (err) { 
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
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

    // 1. Find chat by ID
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 2. Security Check: Does this chat belong to the logged-in user?
    // We don't want User A reading User B's chats!
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

    // Create empty chat
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