import type { ReplaceJobOptions, MegaAnalysisData, UnifiedAnalysisData } from '../types';
import { cacheService, generateFileCacheKey } from '../services/cacheService';
import * as geminiService from '../services/geminiService';
import { preCompositeImage } from '../utils/imageUtils';
import { buildReplacePrompt } from '../utils/promptUtils';

/**
 * [OMNI-OPTIMIZED v12.38]
 * Engine with Identity Anchor Protocol.
 */
export async function runReplaceJob(
    options: ReplaceJobOptions
): Promise<{ imageUrl: string; finalPrompt: string; analysisData: MegaAnalysisData }> {
    // [FIX] Update subjectImage to subjectImages to match ReplaceJobOptions
    const { subjectImages, sceneImage, outfitImage, userPrompt, onProgressUpdate, onPromptGenerated, resolution } = options;

    // [FIX] subjectImages check
    if (!subjectImages || subjectImages.length === 0 || !sceneImage) throw new Error("Missing inputs.");

    onProgressUpdate('ANALYZING_PRIMARY', 'OMNI-SCAN: Menganalisis Biometrik Subjek...');

    // 1. Omni-Analysis PACE
    const cacheKeyOmni = `omni-v12.38-scene-${generateFileCacheKey([sceneImage, outfitImage])}`;
    let omniData = await cacheService.get<UnifiedAnalysisData>(cacheKeyOmni);
    if (!omniData) {
        omniData = await geminiService.performOmniSceneAnalysis(sceneImage, outfitImage);
        if (omniData) await cacheService.set(cacheKeyOmni, omniData);
    }

    // 2. Identity Analysis PACE
    // [FIX] Update subjectImage to subjectImages for cache key
    const cacheKeyMega = `mega-v12.38-identity-${generateFileCacheKey([...subjectImages, outfitImage])}`;
    let analysisData = await cacheService.get<MegaAnalysisData>(cacheKeyMega);
    if (!analysisData) {
        // [FIX] Update subjectImage to subjectImages in service call
        const { data } = await geminiService.analyzeNarrativeIdentity(subjectImages, outfitImage, 'Pro', false);
        analysisData = { 
            unifiedAnalysis: omniData, 
            poseAndShadow: { pose: { subjectCropBox: { x_min: 0, y_min: 0, x_max: 1, y_max: 1 } } } 
        };
        (analysisData as any).nisfData = data;
        await cacheService.set(cacheKeyMega, analysisData);
    } else {
        analysisData.unifiedAnalysis = { ...omniData };
    }

    let targetBox = analysisData.unifiedAnalysis.sceneSubjectAnalysis?.boundingBox || { x_min: 0.3, y_min: 0.2, x_max: 0.7, y_max: 0.8 };

    onProgressUpdate('GENERATING_MASK', 'Identity Diffusion & Ghost Removal...');
    // [FIX] Pass first subject image from array for pre-compositing
    const { compositeImage, maskImage } = await preCompositeImage(subjectImages[0], sceneImage, targetBox, 'soft', analysisData.unifiedAnalysis.perspective, null, null, true);

    const refinePrompt = buildReplacePrompt(options, analysisData);
    onPromptGenerated(refinePrompt);
    
    onProgressUpdate('GENERATING_IMAGE', 'Transferring Identity Pixels...');
    // [FIX] Use plural subjectImages for final blend reference
    let finalImageResult = await geminiService.performInpaintingBlend(compositeImage, maskImage, refinePrompt, resolution, subjectImages);

    if (options.isHarmonizationEnabled) {
        onProgressUpdate('HARMONIZING', 'Penyelarasan Akhir...');
        finalImageResult = await geminiService.performHarmonization(finalImageResult, analysisData.unifiedAnalysis, resolution);
    }

    onProgressUpdate('DONE', 'Likeness Locked: Wajah identik berhasil dirender.');
    return { imageUrl: finalImageResult, finalPrompt: refinePrompt, analysisData };
}