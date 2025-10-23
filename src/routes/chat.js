// routes/chat.js
import express from "express";
import { searchContext } from "../utils/vectorStore.js";
import { queryGemini } from "../utils/gemini.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // searchContext returns objects with {text, score, metadata} NOT pageContent
    const docs = await searchContext(message, 3);
    
    // FIX: Use 'text' field instead of 'pageContent'
    const context = docs.map(d => d.text).join("\n\n");

    // Query gemini with context + question
    const answer = await queryGemini(message, context);

    // Return the LLM answer to frontend
    res.json({ response: answer });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;