import type { ReferenceJobOptions, UnifiedAnalysisData } from "../types";
import { cacheService, generateFileCacheKey } from "../services/cacheService";
import { analyzeReferenceForStyle, generateFinalImage, performHarmonization } from "../services/geminiService";
import { buildReferencePrompt } from "../utils/promptUtils";

/**
 * [RE-ARCHITECTED v8.0]
 * The dedicated engine for the 'Reference' (Style Transfer) mode.
 * Implements the "Analyze, then Generate" workflow.
 */
export async function runReferenceJob(opts: ReferenceJobOptions): Promise<{ imageUrl: string; generatedPrompt: string; analysisData: UnifiedAnalysisData; }> {
  // [FIX] Update subjectBlob to subjectBlobs to match ReferenceJobOptions
  const { onProgressUpdate, onPromptGenerated, referenceFiles, subjectBlobs, resolution, aspectRatio, analysisModels, isHarmonizationEnabled, outfitImage } = opts;

  if (!referenceFiles || referenceFiles.length === 0) {
    throw new Error("Reference file is required for this mode.");
  }
  
  const referenceFile = referenceFiles[0];

  onProgressUpdate('STARTING', 'Initializing Reference Engine...');

  // --- STAGE 1: ANALYSIS ---
  onProgressUpdate('EXTRACTING_STYLE_CACHE_MISS', 'Deconstructing Style DNA...');
  
  const cacheKey = `ref-analysis-v2-${generateFileCacheKey([referenceFile])}`;
  let analysisData = await cacheService.get<UnifiedAnalysisData>(cacheKey);

  if (analysisData) {
      onProgressUpdate('EXTRACTING_STYLE_CACHE_HIT', 'Loading Style DNA (Cache)...');
  } else {
      const { data } = await analyzeReferenceForStyle(referenceFile, analysisModels);
      analysisData = data;
      await cacheService.set(cacheKey, analysisData);
  }

  if (!analysisData) {
      throw new Error("Failed to analyze reference image.");
  }

  // --- STAGE 2: PROMPT CONSTRUCTION ---
  onProgressUpdate('BUILDING_PROMPT', 'Building Director\'s Briefing...');
  
  const finalPrompt = buildReferencePrompt(opts, analysisData);
  onPromptGenerated(finalPrompt);

  // --- STAGE 3: GENERATION ---
  onProgressUpdate('GENERATING_IMAGE', 'Generating New Image...');

  const generatedImageDataUrl = await generateFinalImage(
      finalPrompt,
      'reference',
      // [FIX] Update subjectBlob to subjectBlobs
      subjectBlobs,
      null, 
      null, // CRITICAL: DO NOT PASS THE REFERENCE IMAGE TO THE GENERATOR
      outfitImage, // INTEGRATED: Pass the outfit image
      null, 
      resolution,
      aspectRatio
  );

  const finalImageUrl = generatedImageDataUrl;

  onProgressUpdate('DONE', 'Generation Complete');

  return {
      imageUrl: finalImageUrl,
      generatedPrompt: finalPrompt,
      analysisData: analysisData,
  };
}