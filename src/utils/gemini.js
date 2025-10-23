// utils/gemini.js - Fixed to use the same SDK as vectorStore.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// Use the same client as vectorStore.js
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function queryGemini(question, context) {
  try {
    // Build the prompt with context
    const prompt = `Use the following context to answer the question. If the answer cannot be found in the context, use your own knowledge base."

Context:
${context}

Question: ${question}

Answer:`;

    // Use the same API pattern as vectorStore.js
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use gemini-2.5-flash instead of 2.0
      contents: prompt,
    });

    // Extract the text from response
    return response.text || "No response generated.";

  } catch (err) {
    console.error("Gemini query error:", err);
    throw new Error(`Failed to get response from Gemini: ${err.message}`);
  }
}