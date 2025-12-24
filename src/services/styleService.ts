import { analyzeReferenceImage, StyleEmbedding } from "../cognitive/styleDeconstructor";
import { cacheStyleEmbedding, getStyleEmbedding } from "./styleEmbeddingCache";
import { sha256Hex } from "../lib/preprocessing/imageEnhancer";
import type { AnalysisModelSelection } from "../types";

export async function extractReferenceStyle(blob: Blob, modelSelection: AnalysisModelSelection): Promise<StyleEmbedding> {
  const imageBuffer = await blob.arrayBuffer();
  const cacheKey = await sha256Hex(imageBuffer);

  const cachedEmbedding = await getStyleEmbedding(cacheKey);
  if (cachedEmbedding) {
    console.log(`[StyleService] Cache HIT for key: ${cacheKey.substring(0, 10)}...`);
    return cachedEmbedding;
  }
  console.log(`[StyleService] Cache MISS for key: ${cacheKey.substring(0, 10)}...`);
  
  const embedding = await analyzeReferenceImage(blob, modelSelection);
  
  embedding.id = cacheKey;
  await cacheStyleEmbedding(embedding);
  
  return embedding;
}

export async function mergeEmbeddingsServer(refs: { embedding: StyleEmbedding; weight: number }[]) {
  const merged: any = { palette: [], lighting: null, lens: null, texture_signatures: [], region_style: [] };
  const total = refs.reduce((s, r) => s + (typeof r.weight === "number" ? r.weight : 1), 0) || 1;
  
  for (const r of refs) {
    const e = r.embedding || ({} as any);
    const w = (typeof r.weight === "number" ? r.weight : 1) / total;
    
    if (Array.isArray(e.palette)) {
      merged.palette.push(...e.palette.map((c: string) => ({ color: c, weight: w })));
    }
    if (e.lighting && (!merged.lighting || w > 0.5)) merged.lighting = e.lighting;
    if (e.lens && (!merged.lens || w > 0.5)) merged.lens = e.lens;
    if (e.texture_signatures && (!merged.texture_signatures || w > 0.5)) merged.texture_signatures = e.texture_signatures;
  }
  return merged;
}

export async function getCachedStyle(id: string) {
  return getStyleEmbedding(id);
}