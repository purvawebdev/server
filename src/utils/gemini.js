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

export async function queryGeminiStream(userMessage, context, onChunk) {
  try {
    console.log("Starting Gemini stream...");
    const systemPrompt = `Use the provided context to answer questions accurately. If the answer cannot be found in the context, use your own knowledge base.

Context:
${context || "No context available"}`;

    console.log("Calling generateContentStream with:", { userMessage, contextLength: context.length });
    
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      contents: userMessage,
    });

    console.log("Stream created, starting iteration...");
    let chunkCount = 0;

    for await (const chunk of stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) {
        chunkCount++;
        console.log(`Chunk ${chunkCount}:`, text.substring(0, 50) + "...");
        onChunk(text);
      }
    }

    console.log(`Stream completed with ${chunkCount} chunks`);

  } catch (err) {
    console.error("Gemini stream error:", err);
    throw new Error(`Failed to stream response from Gemini: ${err.message}`);
  }
}