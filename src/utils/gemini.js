// utils/gemini.js — modern Gemini SDK version
// This replaces the manual fetch() API call and uses the official Google client.

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini client with your API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Exported function to query Gemini with context + question
export async function queryGemini(question, context) {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the combined input string
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;

    // Generate the response (non-streaming)
    const result = await model.generateContent(prompt);

    // result.response.text() gives you the generated text
    const output = result.response.text();
    return output || "No valid response.";
  } catch (err) {
    console.error("Gemini SDK error:", err);
    return "An error occurred while fetching AI response.";
  }
}
//add the stream effect later it is inbuilt in the sdk 