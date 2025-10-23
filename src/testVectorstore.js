// testVectorstore.js
import { storeDocument, searchContext } from "./utils/vectorStore.js";

const sampleText = `
Artificial Intelligence is the simulation of human intelligence processes by machines.
These processes include learning, reasoning, and self-correction.
AI applications include advanced web search engines, recommendation systems, 
understanding human speech, self-driving cars, and competing at the highest 
level in strategic game systems.
`;

async function main() {
  try {
    console.log("🚀 Starting vector store test...");
    
    // Verify environment variables
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY environment variable is required");
    }
    if (!process.env.PINECONE_INDEX) {
      throw new Error("PINECONE_INDEX environment variable is required");
    }

    console.log("✅ Environment variables verified");
    
    // Store document
    const vectorCount = await storeDocument(sampleText, { 
      source: "test-doc",
      timestamp: new Date().toISOString()
    });
    
    console.log(`📊 Stored ${vectorCount} vectors`);
    
    // Wait a moment for Pinecone to index
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Search for context
    const results = await searchContext("What is AI?");
    console.log("🔍 Search results:", JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }
}

main();