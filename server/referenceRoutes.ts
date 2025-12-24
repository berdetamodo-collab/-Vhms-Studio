
/**
 * server/referenceRoutes.ts
 * Express routes for Reference Mode v4.1
 * - POST /api/reference/analyze     (multipart: reference image(s))
 * - POST /api/reference/multi-merge (JSON: { refs: [{embedding, weight}] })
 * - POST /api/reference/generate    (JSON: { prompt, subjectB64, styleEmbedding, options })
 *
 * This file is safe to create. It does not store secrets. It expects GEMINI_API_KEY in server env.
 */
import express from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY missing in environment");
}

/** Minimal helper to call Gemini style analysis/generation. */
async function callGemini(model: string, payload: any) {
  if (!KEY) throw new Error("GEMINI_API_KEY missing");
  // Using official SDK pattern if available on server, or direct fetch if simpler for this snippet
  // For consistency with server-side node-fetch usage in provided snippet, implementing fetch wrapper
  // assuming pure node environment.
  const GEMINI_BASE = "https://generativeai.googleapis.com/v1beta"; 
  // Adjusting base URL for v1beta or v1 depending on model availability
  
  const response = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${txt}`);
  }
  return await response.json();
}

/**
 * Analyze reference image into structured style embedding.
 * Returns raw analysis in .analysis for client normalization.
 */
// FIX: Cast upload.single(...) to 'any' to resolve strict type mismatch between multer and express types in this setup.
router.post("/api/reference/analyze", upload.single("reference") as any, async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing reference image" });
    const b64 = req.file.buffer.toString("base64");
    
    // Construct Gemini Prompt for Style Extraction
    const payload = {
      contents: [{
        parts: [
          { text: "Deconstruct the image into a strict JSON style embedding only. Return JSON only. Fields: palette[], lighting{direction,intensity,temperature}, lens{focalLength,aperture}, texture_signatures[], region_style[] (regionId,dominantPalette,textureHint). DO NOT describe people, objects, or content." },
          { inline_data: { mime_type: "image/jpeg", data: b64 } }
        ]
      }],
      generationConfig: {
          response_mime_type: "application/json"
      }
    };

    if (!KEY) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
    
    // Using 2.5-flash for speed
    const result = await callGemini("gemini-2.5-flash", payload);
    
    // Extract text from Gemini response structure
    let analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    let analysisJson = {};
    try {
        if(analysisText) analysisJson = JSON.parse(analysisText);
    } catch(e) {}

    return res.json({ analysis: analysisJson });
  } catch (err: any) {
    console.error("reference/analyze error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Merge multiple embeddings server-side deterministically.
 * Input: { refs: [{ embedding: {...}, weight: number }] }
 * Returns: { merged: {...} }
 */
// FIX: Cast express.json() to 'any' to resolve strict type mismatch.
router.post("/api/reference/multi-merge", express.json() as any, async (req: any, res: any) => {
  try {
    const { refs } = req.body;
    if (!Array.isArray(refs) || refs.length === 0) return res.status(400).json({ error: "Missing refs" });

    // Deterministic merge: weighted palette union, prefer highest-weight lighting & lens
    const merged: any = { palette: [], lighting: null, lens: null, texture_signatures: [], region_style: [] };
    // Normalize total weight
    const total = refs.reduce((s: number, r: any) => s + (typeof r.weight === "number" ? r.weight : 1), 0) || 1;
    
    for (const r of refs) {
      const e = r.embedding || {};
      const w = (typeof r.weight === "number" ? r.weight : 1) / total;
      
      // palette: collect with weight marker (client should reduce duplicates)
      if (Array.isArray(e.palette)) {
        merged.palette.push(...e.palette.map((c: string) => ({ color: c, weight: w })));
      }
      // Simple heuristic for single objects: take from heaviest weight
      if (e.lighting && (!merged.lighting || w > 0.5)) merged.lighting = e.lighting;
      if (e.lens && (!merged.lens || w > 0.5)) merged.lens = e.lens;
      
      if (Array.isArray(e.texture_signatures)) merged.texture_signatures.push(...e.texture_signatures);
      if (Array.isArray(e.region_style)) merged.region_style.push(...(e.region_style.map((rs: any) => ({ ...rs, weight: w }))));
    }
    return res.json({ merged });
  } catch (err: any) {
    console.error("reference/multi-merge error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Generate image using subject + style embedding
 * Input: { prompt, subjectB64, styleEmbedding, options }
 * This forwards to Gemini image model. Adjust model names as required.
 */
// FIX: Cast express.json() to 'any' to resolve strict type mismatch.
router.post("/api/reference/generate", express.json() as any, async (req: any, res: any) => {
  try {
    const { prompt, subjectB64, styleEmbedding, options } = req.body;
    if (!prompt || !subjectB64) return res.status(400).json({ error: "Missing prompt or subject" });
    if (!KEY) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    const model = (options && options.resolution === "2K") ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";

    const payload = {
      contents: [{
          parts: [
              { text: `STYLE EMBEDDING:${JSON.stringify(styleEmbedding || {})}\n\n${prompt}` },
              { text: "[IMAGE 1: ACTOR_SOURCE]" },
              { inline_data: { mime_type: "image/png", data: subjectB64 } }
          ]
      }],
      // Image generation config not strictly standard in generateContent but passing structure
      // For real implementation, this would use the image generation specific API method/params
    };

    // Note: This is a simplified proxy. In production, use generateImages or generateContent with specific image params.
    const result = await callGemini(model, payload);
    
    // Return raw result; client will normalize.
    return res.json({ result });
  } catch (err: any) {
    console.error("reference/generate error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;