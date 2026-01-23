import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/chat",protect, handleChat);
    
export default router;
