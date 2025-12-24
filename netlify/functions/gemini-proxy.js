
// File: netlify/functions/gemini-proxy.js
// [FIX] Updated to ES Module syntax to match project 'type': 'module' configuration.

import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    // [LOGGING] Generate a unique ID for this request for traceability.
    const requestId = randomUUID();
    
    console.log(`[Proxy Request START: ${requestId}] Method: ${event.httpMethod}`);

    // CORS Headers for robust client access
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        console.warn(`[Proxy Request END: ${requestId}] Blocked due to invalid method.`);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // 1. Dapatkan Kunci dari Environment Pool
    const keyPoolString = process.env.GEMINI_KEY_POOL;
    
    // Fallback: If pool is empty, try single key (for dev simplicity)
    const singleKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    let KEY_POOL = [];
    if (keyPoolString && keyPoolString.trim().length > 0) {
        KEY_POOL = keyPoolString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    } else if (singleKey) {
        console.log(`[Proxy INFO: ${requestId}] Using single fallback API key.`);
        KEY_POOL = [singleKey];
    }

    if (KEY_POOL.length === 0) {
        console.error(`[Proxy FATAL: ${requestId}] No API Keys found in Environment.`);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "FATAL: Server configuration error (Missing API Keys)." }),
        };
    }
    
    // 2. Acak Urutan Kunci untuk Distribusi Beban
    const shuffledKeys = [...KEY_POOL].sort(() => 0.5 - Math.random());
    console.log(`[Proxy INFO: ${requestId}] Key pool loaded. ${shuffledKeys.length} keys available.`);

    // 3. Persiapan Payload
    let payload;
    let modelName;
    try {
        const body = JSON.parse(event.body);
        payload = body.promptBody; // The main payload for Google API
        modelName = body.modelName; // The model name (e.g., 'gemini-2.5-flash')
        
        if (!payload || !modelName) {
            throw new Error("Request body must include 'promptBody' and 'modelName'.");
        }
    } catch (e) {
        console.error(`[Proxy ERROR: ${requestId}] Invalid JSON payload.`, e.message);
        return { 
            statusCode: 400, 
            headers,
            body: JSON.stringify({ error: "Invalid JSON payload.", details: e.message }) 
        };
    }

    let lastError = null;

    // 4. Loop Retry Kritis
    for (const apiKey of shuffledKeys) {
        const shortKey = `${apiKey.substring(0, 5)}...${apiKey.slice(-4)}`;
        // [LOGGING] Log which key is being attempted.
        console.log(`[Proxy ATTEMPT: ${requestId}] Trying Key: ${shortKey} for model ${modelName}`);
        
        try {
            // [REFACTOR] Instantiate the SDK client with the current key from the pool.
            const ai = new GoogleGenAI({ apiKey });

            // [REFACTOR] Make the API call using the robust SDK method.
            // The payload from the client already contains `contents` and `config`.
            const response = await ai.models.generateContent({
                model: modelName,
                ...payload,
            });
            
            // Berhasil!
            console.log(`[Proxy SUCCESS: ${requestId}] Successfully used Key: ${shortKey}`);
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', ...headers },
                // The SDK response object needs to be carefully serialized
                // We extract the relevant parts usually, but stringifying the whole object works for the SDK.
                body: JSON.stringify(response),
            };
            
        } catch (error) {
            // The SDK throws helpful errors. We'll capture the message.
            const errorMessage = error.message || 'An unknown error occurred with the SDK.';
            lastError = errorMessage;
            console.warn(`[Proxy FAILED_ATTEMPT: ${requestId}] Key ${shortKey} failed: ${errorMessage}`);
            
            // Check for specific error codes that shouldn't trigger a retry (like Bad Request)
            if (errorMessage.includes("400") || errorMessage.includes("INVALID_ARGUMENT")) {
                 console.error(`[Proxy ABORT: ${requestId}] Invalid Argument - Aborting retry loop.`);
                 return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Permintaan Ditolak oleh Google AI (400)", details: errorMessage })
                 };
            }
        }
    }
    
    // 5. Gagal Total
    console.error(`[Proxy FATAL: ${requestId}] All keys in the pool failed. Last recorded error: ${lastError}`);
    return {
        statusCode: 429, // "Too Many Requests" implies exhaustion
        headers,
        body: JSON.stringify({
            error: "Layanan Sedang Sibuk (Semua Kunci API Mencapai Batas).",
            details: lastError || "Tidak ada detail error yang tersedia.",
        }),
    };
};
