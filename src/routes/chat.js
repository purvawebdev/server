//chat route: receives user message,searches Pinecone for context, sends to Gemini, returns reply.

import express from "express";
import {searchContext} from "../utils/vectorStore.js"
import {queryGemini} from "../utils/gemini.js"

const router = express.Router();

router.post("/chat", async(req,res)=> {
    try{
        const{message} = req.body;
        if(!message) return res.status(400).json({error :"Message required"});

        //search Pinecone for top 3 related chunks
        const docs = await searchContext(message, 3);
        //build a textual context by concatenating the chunks
        const context = docs.map(d=>d.pageContent).join("\n\n");

        //query gemini with context + question
        const answer = await queryGemini(message,context);

        //return the llm answer to the frontend
        res.json({response:answer});

    }catch(err){
        console.error("Chat error:",err);
        res.status(500).json({error:err.message});
    }
});

export default router;