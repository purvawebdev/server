import { searchContext } from "../utils/vectorStore.js";
import { queryGemini } from "../utils/gemini.js";


export const handleChat = async (req , res ) => {
    try{
        const {message} = req.body;

        if(!message){
            return res.status(400).json({error:"Message required bro pls enter a godamn message"});
        }

        //Rag logic 
        // TODO: Add logic here: "If no PDF is active, skip this search"

        const docs = await searchContext(message , 3);
        const context = docs.map(d => d.text).join("\n\n");

        //Ai Interaction
        // TODO: Fetch previous 5 messages from MongoDB here to add to history

        const answer = await queryGemini(message, context);

        //persistance
        // TODO: Save (User Message + AI Answer) to MongoDB here

        res.json({response: answer});

    }catch(err){
        console.error("Chat error:", err);
        res.status(500).json({error:err.message});
    }
};