// Upload route: accepts PDF file, extracts text directly from buffer,
// splits/embeds text and pushes to Pinecone via vectorStore.storeDocument

import express from "express";
import multer from "multer";
import { storeDocument } from "../utils/vectorStore.js";

const router = express.Router();

// Use memory storage instead of disk storage - no temp files!
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // FIX: Import the new PDFParse class from pdf-parse v2
    const { PDFParse } = await import("pdf-parse");

    // Create parser instance with the PDF buffer
    const parser = new PDFParse({ 
      data: req.file.buffer 
    });

    // Extract text using the new API
    const result = await parser.getText();
    
    // Always destroy the parser to free memory
    await parser.destroy();

    // Store extracted text in Pinecone
    const chunksStored = await storeDocument(result.text, {
      source: req.file.originalname,
      uploaded_at: new Date().toISOString(),
      file_size: req.file.size
    });

    res.json({
      success: true,
      chunks: chunksStored,
      message: `PDF processed successfully! Stored ${chunksStored} text chunks.`,
      file_info: {
        original_name: req.file.originalname,
        size: req.file.size,
        text_length: result.text.length
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;