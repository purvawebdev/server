// Upload route: accepts PDF file, extracts text directly from buffer,
// splits/embeds text and pushes to Pinecone via vectorStore.storeDocument

import multer from "multer";
import { handleUpload } from "../controllers/uploaderController.js";
import express from "express";
  
const router = express.Router();

// Use memory storage instead of disk storage - no temp files!
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

router.post("/upload",upload.single("file"),handleUpload);

export default router;