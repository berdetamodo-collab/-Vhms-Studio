
/**
 * src/services/gemini/geminiAdapter.ts
 * Wrapper for Gemini API calls to ensure consistency.
 * Defaults to using the official SDK client-side to support serverless usage.
 */
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
};

export const geminiAdapter = {
    generateContent: async (model: string, prompt: string, images: Blob[] = []) => {
        const ai = getClient();
        const parts: any[] = [{ text: prompt }];
        
        for (const img of images) {
            const b64 = await blobToBase64(img);
            parts.push({ inlineData: { mimeType: img.type || 'image/jpeg', data: b64 } });
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts }
        });
        return response;
    }
};

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(',')[1]);
        };
        reader.readAsDataURL(blob);
    });
}
