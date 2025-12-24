
// src/lib/postProcessing/harmonizer.ts
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// These are imported for type consistency with the user's prompt, but are placeholders.
import { applyColorGrading, applyFilmGrain } from './imageEnhancements';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Kunci API tidak ditemukan.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

const fileToGenerativePart = async (file: File | Blob): Promise<Part> => {
  return new Promise<Part>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            const parts = reader.result.split(',');
            if (parts.length > 1) {
                resolve({ inlineData: { data: parts[1], mimeType: file.type } });
            } else {
                reject(new Error("Gagal memproses data gambar (Invalid Data URL)."));
            }
        } else {
            reject(new Error("Gagal membaca file gambar."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export async function harmonizeImage(image: Blob, settings: { applyGrain: boolean, colorProfile: string }): Promise<Blob> {
    
    let prompt = "Harmonize this image. ";
    
    // V10 FIX: Only apply grain if explicitly true, and DO NOT default to generic cinematic look.
    if (settings.applyGrain) {
        prompt += "Apply a subtle, realistic sensor noise or film grain suitable for the image style. ";
    }

    if (settings.colorProfile && settings.colorProfile !== 'cinematic') {
        // If a specific profile is requested (other than the 'cinematic' default which caused issues)
        prompt += `Apply a ${settings.colorProfile} color grade. `;
    } else {
        // If no profile or 'cinematic' was passed from the default UI state but we want raw reference adherence:
        prompt += "Maintain the natural color profile and white balance of the generated image. Do NOT apply heavy color grading filters. ";
    }

    prompt += "Ensure the final result is photorealistic. Fix any compositing artifacts."

    const ai = getAIClient();
    const imagePart = await fileToGenerativePart(image);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Using flash for speed in post-processing
        contents: {
          parts: [
            { text: prompt },
            imagePart
          ]
        },
    });

    const resultPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!resultPart?.inlineData) {
      throw new Error("Harmonization did not return an image.");
    }
    
    const imageBase64 = resultPart.inlineData.data;
    const byteChars = atob(imageBase64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const finalBlob = new Blob([byteArray], { type: resultPart.inlineData.mimeType });
    
    return finalBlob;
}
