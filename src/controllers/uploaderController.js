import { storeDocument } from "../utils/vectorStore.js";
import { Document } from "@langchain/core/documents";

export const handleUpload = async(req,res) => {
    try{
        if(!req.file){
            return res.status(400).json({error:"No file uploaded bro please upload a file  ffs"});
        }

        const {PDFParse} = await import("pdf-parse");
        const parser = new PDFParse({data: req.file.buffer});
        const pdfResult = await parser.getText();
        await parser.destroy();

        if(!pdfResult.text){
            throw new Error("Failed to extract text from PDF");
        }
        

        //VECTOR DATABASE STORAGE
        //todo : pass userid here later for the namespaces 

        const chunksStored = await storeDocument(pdfResult.text,{
            source: req.file.originalname,
            updated_at: new Date().toISOString,
            file_size: req.file.size
        });

        // 4. MongoDB Storage (addded temp until we add auth)
        const newDoc = await Document.create({
            userId:"temp_user_id",
            filename:req.file.originalname,
            stats:{
                size:req.file.size,
                characterCount:pdfResult.text.length,
                chunks:chunksStored
            }
        });
        // 5. Response
    res.json({
      success: true,
      documentId: newDoc._id,
      message: `Processed ${req.file.originalname} into ${chunksStored} chunks.`
    });

    }
    catch(err){
        console.error("Upload error:",err);
        res.status(500).json({error:err.message});
    }
};