// --- Imports and Setup ---
require('dotenv').config();
const express = require('express');
const { formidable } = require('formidable');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");
const PocketBase = require('pocketbase/cjs');

const { 
    // process_image_to_receipt_json, 
    // format_json_to_lowercase,
    //classify_and_normalize_items
    process_image_to_normalized_json
} = require('./functions.js');

const app = express();
const PORT = 3005;
const HOST = '127.0.0.1';

// The API key is passed directly as a string, not in an object.
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
const pb = new PocketBase('http://127.0.0.1:8090'); 
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Extract token from "Bearer Tprocess_image_to_receipt_jsonOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    try {
        // Load the token into the auth store
        pb.authStore.save(token, null);
        
        // Verify and refresh the token's validity
        await pb.collection('users').authRefresh();

        if (!pb.authStore.isValid) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
        }
        
        // Attach user model to the request for potential use in the route
        req.user = pb.authStore.model;
        next(); // Token is valid, proceed to the route handler
    } catch (err) {
        // Clear the store on error to prevent invalid state
        pb.authStore.clear();
        return res.status(401).json({ error: 'Unauthorized: Token is invalid or expired.' });
    }
};

// --- Routes ---

// ✅ New route for user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        // Authenticate with PocketBase
        const authData = await pb.collection('users').authWithPassword(email, password);

        res.status(200).json({
            message: "Login successful!",
            user: authData.record,
            token: authData.token
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(401).json({ error: 'Invalid credentials.' });
    }
});


app.post('/scan-receipt', authenticateUser, async (req, res) => {
    console.log(`Request received from authenticated user: ${req.user.email}`);
    
    const form = formidable({});

    try {
        const [fields, files] = await form.parse(req);
        const imageFile = files.image?.[0];

        if (!imageFile) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        console.log("Image file received, converting to Base64...");
        const base64ImageFile = fileToBase64(imageFile.filepath);
        
        // --- Unified AI Pipeline ---
        console.log("Conversion complete. Processing image with unified AI function...");
        const finalJsonString = await process_image_to_normalized_json(ai, base64ImageFile);

        // --- Old AI Pipeline (Commented Out) ---
        // console.log("Conversion complete. [1/3] Extracting items from image...");
        // const rawJsonString = await process_image_to_receipt_json(ai, base64ImageFile);
        // 
        // console.log("[2/3] Formatting and cleaning extracted JSON...");
        // const formattedJsonString = await format_json_to_lowercase(ai, rawJsonString);
        // 
        // console.log("[3/3] Classifying, normalizing, and categorizing items...");
        // const finalJsonString = await classify_and_normalize_items(ai, formattedJsonString);

        //console.log(finalJsonString)
        
        console.log("All AI processing complete. Parsing final JSON...");

        let finalJson;
        try {
            // The final, fully processed string is now parsed
            const cleanedString = finalJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
            finalJson = JSON.parse(cleanedString);
        } catch (parseError) {
            // Log the string from the *final* step if parsing fails
            console.error("Failed to parse JSON from final AI response:", finalJsonString);
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