import express from "express";
import { handleChat, getAllChats, getChat, createNewChat } from "../controllers/chatController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/chat/new", protect, createNewChat);
router.get("/chat", protect, getAllChats);
router.post("/chat", protect, handleChat);
router.get("/chat/:id", protect, getChat);
    
export default router;
