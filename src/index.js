// Entry point for the Express server

import express from "express";               // Express web framework
import cors from "cors";                     // CORS middleware so frontend can call backend
import dotenv from "dotenv";                 // Loads .env into process.env
import chatRoutes from "./routes/chat.js";   // Chat API routes (search + query LLM)
import uploadRoutes from "./routes/upload.js"; // Upload API routes (PDF upload & embedding)

dotenv.config(); // Load environment variables from server/.env

const app = express();

app.use(cors());         // Allow cross-origin requests (adjust in prod)
app.use(express.json()); // Parse JSON bodies (for /api/chat)

app.use("/api", chatRoutes);   // Mount chat routes at /api
app.use("/api", uploadRoutes); // Mount upload routes at /api

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
