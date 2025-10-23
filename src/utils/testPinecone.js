import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

async function test() {
  console.log("🔍 Checking your Pinecone setup...");
  
  // List all available indexes in your project
  const list = await pc.listIndexes();
  console.log("Indexes in your account:", list);

  // Connect to your index
  const index = pc.index(process.env.PINECONE_INDEX);

  // Get index info
  const stats = await index.describeIndexStats();
  console.log("📊 Index stats:", JSON.stringify(stats, null, 2));
}

test().catch(console.error);
