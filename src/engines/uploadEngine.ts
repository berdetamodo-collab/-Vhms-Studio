import type { UploadJobOptions, MegaAnalysisData, UnifiedAnalysisData, Rect } from '../types';
import { cacheService, generateFileCacheKey } from '../services/cacheService';
import * as geminiService from '../services/geminiService';
import { preCompositeImage } from '../utils/imageUtils';
import { buildSceneBasedPrompt } from '../utils/promptUtils';

/**
 * [OMNI-CONSOLIDATED v12.29]
 * Menjalankan analisis terpadu dengan integrasi Panel Konfigurasi.
 */
export async function runUploadAnalysis(
    options: UploadJobOptions
): Promise<{ analysisData: MegaAnalysisData }> {
    // [FIX] Update subjectImage to subjectImages (plural) to match UploadJobOptions interface
    const { subjectImages, sceneImage, outfitImage, onProgressUpdate, analysisModels } = options;

    onProgressUpdate('ANALYZING_PRIMARY', 'OMNI-SCAN: Menganalisis Optik, Kulit, Pakaian & Rambut...');
    
    // PACE: Sertakan profil model (Pro/Fast) dalam cache key agar perubahan model memicu analisis ulang.
    const modelProfile = Object.values(analysisModels).join('-');
    const cacheKeyOmni = `omni-v12.29-${modelProfile}-${generateFileCacheKey([sceneImage, outfitImage])}`;
    
    let omniData = await cacheService.get<UnifiedAnalysisData>(cacheKeyOmni);
    
    if (!omniData) {
        // Gunakan setelan modul dari panel Bos
        omniData = await geminiService.performOmniSceneAnalysis(sceneImage, outfitImage, analysisModels);
        if (omniData) await cacheService.set(cacheKeyOmni, omniData);
    }

    const megaResultData: MegaAnalysisData = {
        unifiedAnalysis: omniData,
        poseAndShadow: { pose: { subjectCropBox: { x_min: 0, y_min: 0, x_max: 1, y_max: 1 } } }
    };

    onProgressUpdate('ANALYZING_PRIMARY', 'Omni-Analysis v12.29 Complete.');
    return { analysisData: megaResultData };
}

/**
 * Menjalankan generasi untuk mode Upload.
 */
export async function runUploadGeneration(
    options: UploadJobOptions,
    analysisData: MegaAnalysisData,
    placementBox: Rect
): Promise<{ imageUrl: string; finalPrompt: string }> {
    const { onProgressUpdate, onPromptGenerated, resolution } = options;

    onProgressUpdate('BUILDING_PROMPT', 'Menyusun Blueprint Directive...');
    const finalPrompt = buildSceneBasedPrompt(options, analysisData);
    onPromptGenerated(finalPrompt);

    onProgressUpdate('GENERATING_MASK', 'Menghitung Kedalaman & Masker...');
    // [FIX] Pass the first subject image from the subjectImages array
    const { compositeImage, maskImage } = await preCompositeImage(
        options.subjectImages[0], 
        options.sceneImage, 
        { 
            x_min: placementBox.x / 1000, 
            y_min: placementBox.y / 1000, 
            x_max: (placementBox.x + placementBox.width) / 1000, 
            y_max: (placementBox.y + placementBox.height) / 1000 
        }, 
        analysisData.unifiedAnalysis.photometric?.shadowQuality || 'soft',
        analysisData.unifiedAnalysis.perspective,
        null,
        null
    );

    onProgressUpdate('GENERATING_IMAGE', 'Mensintesis Hasil Akhir...');
    // [FIX] Pass the subjectImages array to the blending service
    let finalImageUrl = await geminiService.performInpaintingBlend(compositeImage, maskImage, finalPrompt, resolution, options.subjectImages);

    if (options.isHarmonizationEnabled) {
        onProgressUpdate('HARMONIZING', 'Harmonisasi Akhir...');
        finalImageUrl = await geminiService.performHarmonization(finalImageUrl, analysisData.unifiedAnalysis, resolution);
    }

    onProgressUpdate('DONE', 'Generasi Fotorealistis Selesai.');
    return { imageUrl: finalImageUrl, finalPrompt };
}