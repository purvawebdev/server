// -------------------------------------------------------------
// Gemini Embeddings + Pinecone Integration
// -------------------------------------------------------------
// This module:
//  1. Converts text into embeddings using Gemini's API
//  2. Stores and retrieves those embeddings from Pinecone
// -------------------------------------------------------------

import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";

dotenv.config();

// Constants
const EMBEDDING_MODEL = "text-embedding-004";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const RATE_LIMIT_DELAY = 100;

// Initialize clients
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Text splitter for document processing
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
});

/**
 * Extract embedding from Gemini API response
 */
function extractEmbedding(response) {
  if (response.embedding?.values) return response.embedding.values;
  if (response.embedding) return response.embedding;
  if (response.embeddings?.[0]?.values) return response.embeddings[0].values;
  if (response.embeddings?.[0]) return response.embeddings[0];
  
  throw new Error("Unexpected response structure from Gemini API");
}

/**
 * Generate embedding for text using Gemini API
 */
export async function generateEmbedding(text) {
  if (!text?.trim()) {
    throw new Error("Text cannot be empty for embedding generation");
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
  });

  const embedding = extractEmbedding(response);

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("No valid embedding returned from Gemini API");
  }

  return embedding;
}

/**
 * Process document: split, generate embeddings, and store in Pinecone
 */
export async function storeDocument(text, metadata = {}) {
  if (!text?.trim()) {
    throw new Error("Document text cannot be empty");
  }

  // Split document into chunks
  const chunks = await splitter.splitText(text);
  const docs = chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: chunk,
        metadata: { ...metadata, chunk_index: index },
      })
  );

  const index = pc.index(process.env.PINECONE_INDEX);
  
  // Generate embeddings for each chunk
  const vectors = [];
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const embedding = await generateEmbedding(doc.pageContent);
    
    vectors.push({
      id: `${metadata.source || "doc"}_${Date.now()}_${i}`,
      values: embedding,
      metadata: { 
        ...doc.metadata, 
        text: doc.pageContent,
        chunk_length: doc.pageContent.length
      },
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  }

  if (vectors.length === 0) {
    throw new Error("No vectors were successfully generated");
  }

  // Store vectors in Pinecone
  await index.upsert(vectors);
  return vectors.length;
}

/**
 * Search for relevant context using semantic similarity
 */
export async function searchContext(query, topK = 3) {
  if (!query?.trim()) {
    throw new Error("Query cannot be empty");
  }

  const queryEmbedding = await generateEmbedding(query);
  const index = pc.index(process.env.PINECONE_INDEX);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return (results.matches || []).map(match => ({
    score: match.score,
    text: match.metadata?.text,
    metadata: match.metadata,
  }));
}