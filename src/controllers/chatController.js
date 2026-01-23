import { Chat } from "../models/Chat.js"; // <--- Import the Model
import { searchContext } from "../utils/vectorStore.js";
import { queryGemini } from "../utils/gemini.js";

export const handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user._id; // Get User ID from the Token

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // --- 1. Find or Create a Chat Session ---
    // Try to find the last chat for this user
    let chat = await Chat.findOne({ userId: userId }).sort({ updatedAt: -1 });

    // If no chat exists, create a brand new one
    if (!chat) {
      chat = await Chat.create({
        userId: userId,
        title: "New Conversation",
        messages: []
      });
    }

    // --- 2. Save User Message ---
    chat.messages.push({
      role: "user",
      content: message
    });

    // --- 3. AI Logic (RAG + Gemini) ---
    // (This part assumes your utils are working)
    const docs = await searchContext(message, 3);
    const context = docs.map(d => d.text).join("\n\n");
    
    const answer = await queryGemini(message, context);

    // --- 4. Save AI Message ---
    chat.messages.push({
      role: "assistant",
      content: answer
    });

    // --- 5. COMMIT TO DATABASE ---
    await chat.save(); // <--- THIS IS THE MAGIC LINE!

    res.json({ 
      response: answer, 
      chatId: chat._id 
    });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
};