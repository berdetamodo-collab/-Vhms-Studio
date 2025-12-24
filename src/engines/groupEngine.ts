import type { GroupJobOptions, MegaAnalysisData, Rect, UnifiedAnalysisData } from '../types';
import { cacheService, generateFileCacheKey } from '../services/cacheService';
import * as geminiService from '../services/geminiService';
import { preCompositeImage } from '../utils/imageUtils';
import { buildSceneBasedPrompt } from '../utils/promptUtils';

/**
 * [OMNI-OPTIMIZED v12.21]
 * Engine for Group Mode using Consolidated API strategy.
 */
export async function runGroupJob(
    options: GroupJobOptions,
    placementBox: Rect
): Promise<{ imageUrl: string; finalPrompt: string; analysisData: MegaAnalysisData }> {
    // [FIX] Update subjectImage to subjectImages to match GroupJobOptions
    const { subjectImages, sceneImage, outfitImage, userPrompt, onProgressUpdate, onPromptGenerated, resolution } = options;

    onProgressUpdate('ANALYZING_PRIMARY', 'OMNI-SCAN: Menganalisis Biometrik & Fisika Grup...');

    // 1. Omni-Analysis (Consolidated ODC, STMS, CSR, RSM)
    const cacheKeyOmni = `omni-v12-scene-${generateFileCacheKey([sceneImage])}`;
    let omniData = await cacheService.get<UnifiedAnalysisData>(cacheKeyOmni);
    
    if (!omniData) {
        omniData = await geminiService.performOmniSceneAnalysis(sceneImage);
        if (omniData) await cacheService.set(cacheKeyOmni, omniData);
    }

    const targetBox = { 
        x_min: placementBox.x / 1000, 
        y_min: placementBox.y / 1000, 
        x_max: (placementBox.x + placementBox.width) / 1000, 
        y_max: (placementBox.y + placementBox.height) / 1000 
    };

    // 2. Identity Analysis
    onProgressUpdate('ANALYZING_PRIMARY', 'Menyelaraskan Identitas dengan Grup...');
    // [FIX] Update subjectImage to subjectImages for cache key
    const cacheKeyMega = `mega-v12-group-${generateFileCacheKey([...subjectImages, outfitImage])}-${userPrompt}`;
    let analysisData = await cacheService.get<MegaAnalysisData>(cacheKeyMega);
    
    if (!analysisData) {
        // [FIX] Update subjectImage to subjectImages in service call
        const { data } = await geminiService.analyzeNarrativeIdentity(subjectImages, outfitImage, 'Pro', false);
        analysisData = { 
            unifiedAnalysis: omniData, 
            poseAndShadow: { pose: { subjectCropBox: { x_min: 0, y_min: 0, x_max: 1, y_max: 1 } } } 
        };
        analysisData.unifiedAnalysis = { ...omniData };
        await cacheService.set(cacheKeyMega, analysisData);
    } else {
        analysisData.unifiedAnalysis = { ...omniData };
    }

    onProgressUpdate('BUILDING_PROMPT', 'Menyusun Strategi Integrasi Grup...');
    const groupPrompt = buildSceneBasedPrompt(options, analysisData);
    onPromptGenerated(groupPrompt);

    onProgressUpdate('GENERATING_MASK', 'Menyiapkan Masker Interaksi...');
    // [FIX] Use first subject image for pre-compositing
    const { compositeImage, maskImage } = await preCompositeImage(
        subjectImages[0], sceneImage, targetBox, 
        analysisData.unifiedAnalysis.photometric?.shadowQuality || 'soft',
        analysisData.unifiedAnalysis.perspective,
        analysisData.poseAndShadow?.pose?.subjectCropBox,
        null
    );

    onProgressUpdate('GENERATING_IMAGE', 'Mensintesis Subjek ke dalam Grup...');
    // [FIX] Pass subjectImages to inpainting blend
    let finalImageResult = await geminiService.performInpaintingBlend(compositeImage, maskImage, groupPrompt, resolution, subjectImages);

    if (options.isHarmonizationEnabled) {
        onProgressUpdate('HARMONIZING', 'Harmonisasi Akhir...');
        finalImageResult = await geminiService.performHarmonization(finalImageResult, analysisData.unifiedAnalysis, options.resolution);
    }

    onProgressUpdate('DONE', 'Integrasi Grup Berhasil.');
    return { imageUrl: finalImageResult, finalPrompt: groupPrompt, analysisData: analysisData };
}