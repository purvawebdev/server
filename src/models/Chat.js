// server/src/models/Chat.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'assistant'] // Only allow these two roles
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
    index: true 
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    default: null // Null means "General Chat" (no specific file)
  },
  title: { 
    type: String, 
    default: "New Conversation" 
  },
  messages: [messageSchema], // Embed the messages array inside the session
  

},
{
  timestamps:true
});

  

export const Chat = mongoose.model("Chat", chatSessionSchema);