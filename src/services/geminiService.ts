
import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { 
    FileWithPreview, UnifiedAnalysisData, MegaAnalysisData, 
    NarrativeIdentityData, Resolution, AspectRatio,
    AnalysisModelsState, CaptionResponse, AnalysisModelSelection
} from '../types';
import { config } from './configService';

export const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found.");
  return new GoogleGenAI({ apiKey });
};

export const fileToGenerativePart = async (file: File | Blob): Promise<Part> => {
  return new Promise<Part>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            const data = reader.result.split(',')[1];
            resolve({ inlineData: { data, mimeType: file.type } });
        } else reject(new Error("Failed to read file."));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseSafeJson = (text: string | undefined) => {
    if (!text) return null;
    try {
        const cleaned = text.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return null;
    }
};

/** [NEW v12.50] ACTION BRAINSTORMING ENGINE */
export const suggestActions = async (
    subjectImages: FileWithPreview[], // [UPDATED v12.51]
    sceneImage?: FileWithPreview | null
): Promise<string[]> => {
    const ai = getAIClient();
    // Use first subject image for suggestion context
    const parts: Part[] = [await fileToGenerativePart(subjectImages[0])];
    
    let prompt = "";
    if (sceneImage) {
        parts.push(await fileToGenerativePart(sceneImage));
        prompt = `
            Analyze IMAGE 1 (Subject) and IMAGE 2 (Scene).
            Brainstorm 3 diverse, creative, and highly realistic actions the subject can perform in this specific environment.
            RETURN ONLY A JSON ARRAY OF STRINGS.
        `;
    } else {
        prompt = `
            Analyze IMAGE 1 (Subject).
            Suggest 3 creative scenarios or poses for this person.
            RETURN ONLY A JSON ARRAY OF STRINGS.
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: config.models.fast,
            contents: { parts: [...parts, { text: prompt }] },
            config: { responseMimeType: "application/json" }
        });
        return parseSafeJson(response.text) || [];
    } catch (e) {
        return ["standing naturally", "looking at camera", "smiling"];
    }
};

/** [UPGRADED v12.49] AUTO-POSE OMNI-ANALYSIS */
export const performOmniSceneAnalysis = async (
    sceneImage: FileWithPreview, 
    outfitImage?: FileWithPreview | null,
    modelsState?: AnalysisModelsState
): Promise<UnifiedAnalysisData> => {
    const ai = getAIClient();
    const parts: Part[] = [await fileToGenerativePart(sceneImage)];
    if (outfitImage) parts.push(await fileToGenerativePart(outfitImage));

    const physicsPrompt = `
        DECONSTRUCT IMAGE PHYSICS FOR SUBJECT INTEGRATION.
        Return JSON following UnifiedAnalysisData schema.
        FOCUS ON: ANATOMICAL_POSE, CONTACT_SHADOWS, REFLECTIVE_SURFACES, LIGHTING_PHYSICS.
        RETURN JSON ONLY.
    `;

    try {
        const response = await ai.models.generateContent({
            model: config.models.pro,
            contents: { parts: [...parts, { text: physicsPrompt }] },
            config: { responseMimeType: "application/json", temperature: 0.1 }
        });
        return parseSafeJson(response.text) || {};
    } catch (e) { throw new Error("Omni-Analysis Failed."); }
};

/** [UPGRADED v12.51] MPIM INPAINTING BLEND */
export const performInpaintingBlend = async (
    composite: string, 
    mask: string, 
    prompt: string, 
    resolution: Resolution,
    subjectFiles?: FileWithPreview[] | null // [UPDATED v12.51]
): Promise<string> => {
    const ai = getAIClient();
    const parts: Part[] = [];

    if (subjectFiles && subjectFiles.length > 0) {
        parts.push({ text: `DNA_IDENTITY_SOURCES: Use these ${subjectFiles.length} images to understand the subject's face from multiple angles.` });
        for(const file of subjectFiles) {
            parts.push(await fileToGenerativePart(file));
        }
    }

    parts.push({ text: "IMMUTABLE_CANVAS: DO NOT modify any pixels outside the black area." });
    parts.push({ inlineData: { data: composite.split(',')[1], mimeType: 'image/jpeg' } });
    
    parts.push({ text: "RECONSTRUCTION_ZONE: Rebuild the human body inside this mask only." });
    parts.push({ inlineData: { data: mask.split(',')[1], mimeType: 'image/png' } });
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: resolution === 'HD' ? config.models.imageFlash : config.models.imagePro,
        contents: { parts },
        config: { temperature: 0.1, topP: 0.8 }
    });
    
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
};

export const performHarmonization = async (image: string, analysis: UnifiedAnalysisData, resolution: Resolution): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: config.models.imageFlash,
        contents: { parts: [
            { inlineData: { data: image.split(',')[1], mimeType: 'image/png' } },
            { text: `Harmonize pixels using scene context: ${JSON.stringify(analysis)}` }
        ] },
        config: { temperature: 0.1 }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : image;
};

/** [UPGRADED v12.51] MPIM FINAL GENERATION */
export const generateFinalImage = async (
    prompt: string, mode: string, 
    subjects: File[] | null, // [UPDATED v12.51]
    scene: File | null, ref: File | null, outfit: File | null, 
    mask: string | null, res: Resolution, ratio: AspectRatio
): Promise<string> => {
    const ai = getAIClient();
    const parts: Part[] = [{ text: prompt }];
    
    if (subjects) {
        for(const s of subjects) {
            parts.push(await fileToGenerativePart(s));
        }
    }
    if (scene) parts.push(await fileToGenerativePart(scene));
    if (outfit) parts.push(await fileToGenerativePart(outfit));
    if (mask) parts.push({ inlineData: { data: mask.split(',')[1], mimeType: 'image/png' } });

    const response = await ai.models.generateContent({
        model: res === 'HD' ? config.models.imageFlash : config.models.imagePro,
        contents: { parts },
        config: { imageConfig: { aspectRatio: ratio }, temperature: 0.1 }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
};

/** [UPGRADED v12.51] MPIM IDENTITY ANALYSIS */
export const analyzeNarrativeIdentity = async (
    subjects: FileWithPreview[], // [UPDATED v12.51]
    outfit: FileWithPreview | null, 
    modelSelection: AnalysisModelSelection, 
    hasLock: boolean
): Promise<{ data: NarrativeIdentityData }> => {
    const ai = getAIClient();
    const parts: Part[] = [];
    
    for(const s of subjects) {
        parts.push(await fileToGenerativePart(s));
    }
    if (outfit) parts.push(await fileToGenerativePart(outfit));
    
    try {
        const response = await ai.models.generateContent({
            model: config.models.pro,
            contents: { parts: [...parts, { text: "CONSOLIDATE MULTI-ANGLE IDENTITY. Map exact facial structure from all provided references. RETURN JSON ONLY." }] },
            config: { responseMimeType: "application/json", temperature: 0.1 }
        });
        return { data: parseSafeJson(response.text) };
    } catch (e) { throw new Error("Identity Analysis Failed."); }
};

export const generateSocialCaption = async (imageSrc: string, prompt: string): Promise<CaptionResponse> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: config.models.fast,
        contents: { parts: [{ inlineData: { data: imageSrc.split(',')[1], mimeType: 'image/png' } }, { text: "Write social caption. JSON ONLY." }] },
        config: { responseMimeType: "application/json" }
    });
    return parseSafeJson(response.text) || { caption: "", hashtags: [] };
};

export const generateObjectMask = async (sceneImage: FileWithPreview, prompt: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: config.models.imageFlash,
        contents: { parts: [await fileToGenerativePart(sceneImage), { text: prompt }] }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
};

export const analyzeReferenceForStyle = async (ref: FileWithPreview, models: AnalysisModelsState): Promise<{ data: UnifiedAnalysisData }> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: config.models.pro,
        contents: { parts: [await fileToGenerativePart(ref), { text: "EXTRACT STYLE DNA. JSON ONLY." }] },
        config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    return { data: parseSafeJson(response.text) };
};
