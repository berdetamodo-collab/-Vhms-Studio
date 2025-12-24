import type { GenerateJobOptions, NarrativeIdentityData } from '../types';
import { cacheService, generateFileCacheKey } from '../services/cacheService';
import * as geminiService from '../services/geminiService';
import { buildGeneratePrompt } from '../utils/promptUtils';

/**
 * [RE-ARCHITECTED v8.0]
 * The dedicated engine for the 'Generate' (From Prompt) mode.
 * This function encapsulates the entire logic for this mode.
 */
export async function runGenerateJob(
    options: GenerateJobOptions
): Promise<{ imageUrl: string; analysisData: NarrativeIdentityData; finalPrompt: string; }> {
    const { 
        // [FIX] Update subjectImage to subjectImages (plural)
        subjectImages, outfitImage, userPrompt, customIdentityLock,
        onProgressUpdate, onPromptGenerated
    } = options;

    // --- STAGE 1: NARRATIVE IDENTITY ANALYSIS (NISF) ---
    onProgressUpdate('ANALYZING_PRIMARY', 'Running NISF...');
    
    // [FIX] Update subjectImage to subjectImages for cache key and service call
    const cacheKeyNISF = `nisf-v2-${generateFileCacheKey([...subjectImages, outfitImage])}-${!!customIdentityLock}`;
    let nisfData = await cacheService.get<NarrativeIdentityData>(cacheKeyNISF);

    if (!nisfData) {
        // [FIX] Update subjectImage to subjectImages in service call
        const { data } = await geminiService.analyzeNarrativeIdentity(subjectImages, outfitImage, options.analysisModels.subject, !!customIdentityLock);
        nisfData = data;
        await cacheService.set(cacheKeyNISF, nisfData);
    }

    if (!nisfData) {
        throw new Error("Narrative Identity analysis failed.");
    }

    onProgressUpdate('ANALYZING_PRIMARY', 'Analysis Complete');

    // --- STAGE 2: PROMPT CONSTRUCTION ---
    onProgressUpdate('BUILDING_PROMPT', 'Building Director\'s Briefing...');
    const finalConstructedPrompt = buildGeneratePrompt(options, nisfData);
    onPromptGenerated(finalConstructedPrompt);

    // --- STAGE 3: IMAGE GENERATION ---
    onProgressUpdate('GENERATING_IMAGE', 'Generating Image...');
    let finalImageResult = await geminiService.generateFinalImage(
        finalConstructedPrompt,
        'generate',
        // [FIX] subjectImages is already the correct type for generateFinalImage
        subjectImages,
        null, null, outfitImage, null,
        options.resolution,
        options.aspectRatio
    );

    onProgressUpdate('DONE', 'Generation Complete');

    return { 
        imageUrl: finalImageResult,
        analysisData: nisfData,
        finalPrompt: finalConstructedPrompt,
    };
}