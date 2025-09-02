// --- Imports and Setup ---
require('dotenv').config();
const express = require('express');
const { formidable } = require('formidable');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");

const { 
    process_image_to_receipt_json, 
    format_json_to_lowercase 
} = require('./functions.js');

const app = express();
const PORT = 3000;
const HOST = '127.0.0.1';

// The API key is passed directly as a string, not in an object.
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// --- Main Route for Scanning Receipts ---
app.post('/scan-receipt', async (req, res) => {
    console.log("Received a request to /scan-receipt");
    const form = formidable({});

    try {
        const [fields, files] = await form.parse(req);
        const imageFile = files.image?.[0];

        if (!imageFile) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        console.log("Image file received, converting to Base64...");
        const base64ImageFile = fileToBase64(imageFile.filepath);
        console.log("Conversion complete. Processing image with AI...");

        const rawJsonString = await process_image_to_receipt_json(ai, base64ImageFile);
        console.log("First AI pass complete. Formatting JSON...");
        
        const formattedJsonString = await format_json_to_lowercase(ai, rawJsonString);
        console.log("Second AI pass complete. Parsing final JSON...");

        // (FIX 3: Robust JSON Parsing)
        let finalJson;
        try {
            // Clean up potential markdown formatting from the AI's response
            const cleanedString = formattedJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
            finalJson = JSON.parse(cleanedString);
        } catch (parseError) {
            console.error("Failed to parse JSON from AI response:", formattedJsonString);
            throw new Error("AI returned a response that was not valid JSON.");
        }

        res.status(200).json({ text: finalJson });

    } catch (err) {
        console.error('Error in /scan-receipt handler:', err);
        res.status(500).json({ error: 'Failed to process receipt.', details: err.message });
    }
});

// --- Helper Functions ---
function fileToBase64(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

// --- Start the Server ---
app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});