import { Pinecone } from "@pinecone-database/pinecone";
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        filename:{
            type:String,
            required:true
        },
    //will have to store uploadthing url here as well
    fileUrl:{
        type:String,
    },
    pineconeId:{
        type:String
    },
    stats:{
        size: Number,
        characterCount:Number,
        chunks:Number
    },
   timestamps:true
    }
);

export const Document = mongoose.model("Document", documentSchema);