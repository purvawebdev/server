// Upload route: accepts PDF file, uploads to Cloudinary (optional), extracts text,
// splits/embeds text and pushes to Pinecone via vectorStore.storeDocument

import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import cloudinary from "../utils/cloudinary.js"; // cloudinary helper
import { storeDocument } from "../utils/vectorStore.js"; // vector store helper

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // multer writes temp files to uploads/

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Upload the raw PDF to Cloudinary (resource_type raw for non-image files)
    const cloudRes = await cloudinary.uploader.upload(req.file.path, { resource_type: "raw" });

    // Read the temporary file and parse the text using pdf-parse
    const buffer = fs.readFileSync(req.file.path);
    const parsed = await pdf(buffer); // parsed.text contains full text

    // Store extracted text in Pinecone (vector embeddings)
    const chunksStored = await storeDocument(parsed.text, {
      source: req.file.originalname,
      cloud_url: cloudRes.secure_url // store URL so you can link back to original file
    });

    // Delete local temporary upload — we don't keep local PDFs
    fs.unlinkSync(req.file.path);

    // Return success with chunk count and cloud URL for reference
    res.json({
      success: true,
      chunks: chunksStored,
      cloud_url: cloudRes.secure_url
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
