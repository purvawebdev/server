import express from "express";
import { handleChat, getAllChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/chat",protect, getAllChats);
router.post("/chat",protect, handleChat);

    
export default router;
