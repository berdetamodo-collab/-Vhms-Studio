import { GoogleGenAI, Type } from "@google/genai";
import { blobToBase64 } from "../lib/preprocessing/imageEnhancer";
import type { StyleEmbedding, AnalysisModelSelection } from "../types";
import { config } from '../services/configService';
export type { StyleEmbedding };

const getClientAI = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("VITE_GEMINI_API_KEY not found");
  return new GoogleGenAI({ apiKey: key });
};

const styleEmbeddingSchema = {
    type: Type.OBJECT,
    properties: {
        palette: { type: Type.ARRAY, items: { type: Type.STRING, description: "Hex color code" }, description: "Dominant and accent colors." },
        lighting: {
            type: Type.OBJECT,
            properties: {
                keyLightDirection: { type: Type.STRING, description: "e.g., 'top-left', 'frontal', 'backlit'" },
                quality: { type: Type.STRING, enum: ['hard', 'soft', 'diffuse'] },
                temperature: { type: Type.STRING, enum: ['warm', 'neutral', 'cool'] },
                globalMood: { type: Type.STRING, description: "Overall lighting atmosphere, e.g., 'dramatic chiaroscuro'." },
            }
        },
        lens: {
            type: Type.OBJECT,
            properties: {
                focalLength: { type: Type.STRING, enum: ['wide', 'standard', 'telephoto'] },
                aperture: { type: Type.STRING, enum: ['deep', 'shallow'], description: "Describes depth of field." },
                bokeh: { type: Type.STRING, description: "Characteristic of out-of-focus blur, e.g., 'creamy', 'busy'." },
            }
        },
        texture_signatures: {
            type: Type.OBJECT,
            properties: {
                grainType: { type: Type.STRING, enum: ['film', 'digital_noise', 'clean'] },
                intensity: { type: Type.STRING, enum: ['subtle', 'moderate', 'heavy'] },
                structure: { type: Type.STRING, description: "e.g., 'fine and consistent'." }
            }
        }
    },
    required: ["palette", "lighting", "lens", "texture_signatures"]
};

export async function analyzeReferenceImage(blob: Blob, modelSelection: AnalysisModelSelection): Promise<StyleEmbedding> {
  const b64 = await blobToBase64(blob);
  const ai = getClientAI();
  const modelName = modelSelection === 'Pro' ? config.models.pro : config.models.fast;
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { text: "Analyze the image's physical properties. Deconstruct it into a strict JSON object based on the provided schema. Focus only on physics of light, optics, and material. DO NOT describe the content (people, objects, places). Return ONLY the JSON object." },
        { inlineData: { mimeType: "image/jpeg", data: b64 } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: styleEmbeddingSchema
    }
  });

  const analysisText = response.text;
  let raw: any = {};
  try {
      if (analysisText) {
          const cleanedText = analysisText.replace(/^```json\s*|```\s*$/g, '').trim();
          raw = JSON.parse(cleanedText);
      }
  } catch(e) {
      console.warn("Gagal mem-parsing JSON analisis. Teks mentah:", analysisText, e);
      raw = { palette: [], lighting: {}, lens: {}, texture_signatures: {} };
  }

  const normalized: StyleEmbedding = {
      palette: raw.palette || [],
      lighting: raw.lighting,
      lens: raw.lens,
      texture_signatures: raw.texture_signatures,
      raw: raw
  };
  
  return normalized;
}