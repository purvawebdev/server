import express from "express";               
import cors from "cors";                     
import dotenv from "dotenv";                 
import chatRoutes from "./routes/chat.js";   // Chat API routes (search + query LLM)
import uploadRoutes from "./routes/upload.js"; // Upload API routes (PDF upload & embedding)
import authRoutes from "./routes/auth.js";
import connectDB from "./config/db.js";

dotenv.config(); 

connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app',
    'https://your-frontend-domain.netlify.app'
  ],
  credentials: true
}));    
app.use(express.json()); // Parse JSON bodies (for /api/chat)

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);   // Mount chat routes at /api
app.use("/api", uploadRoutes); // Mount upload routes at /api

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
