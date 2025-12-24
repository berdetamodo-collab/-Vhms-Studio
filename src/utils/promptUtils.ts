
import type { 
    ReplaceJobOptions, MegaAnalysisData, UploadJobOptions, 
    GenerateJobOptions, NarrativeIdentityData, ReferenceJobOptions, 
    UnifiedAnalysisData 
} from '../types';

/**
 * ============================================================================
 * [VHMS MASTER SYSTEM INSTRUCTION v13.0]
 * COPY DATA DI BAWAH INI KE TAB 'ADVANCED SETTINGS / SYSTEM INSTRUCTION'
 * ============================================================================
 */
export const VHMS_MODEL_SYSTEM_INSTRUCTION = `
/**
 * ROLE: Visual Harmony & Morphology System (VHMS) Code & Logic Assistant.
 * CONTEXT: React + TypeScript + Gemini 2.5/3.0 Multi-Part Image Integration.
 */

const VHMS_PROTOCOL = {
    MANDATE: "Photorealistic human-in-scene integration with 1:1 biometric fidelity.",
    CORE_RULES: [
        "IDENTITY_LOCK: Face structure from IMAGE 1 is immutable. No face-swapping on existing bodies.",
        "PHYSICS_SYNC: Match lighting direction, color temperature, and contact shadows.",
        "TEXTURE_MAPPING: Preserve skin pores, fabric weaves, and environmental noise grain.",
        "PIXEL_INTEGRITY: No hallucinations, no extra limbs, no sticker-effect integration."
    ],
    
    MODE_DEFINITIONS: {
        GENERATE: {
            task: "CREATIVE_SYNTHESIS",
            logic: "Extract Identity (Image 1) -> Synthesize New Body & World from User Prompt.",
            source: "Image 1 (Head Only), Text (Everything else)."
        },
        UPLOAD: {
            task: "ENVIRONMENTAL_INSERTION",
            logic: "Image 1 (Subject) -> Insert into Image 2 (Immutable Scene).",
            constraint: "LOCKED_BACKGROUND: 0% pixel change to Image 2 outside the subject mask."
        },
        REFERENCE: {
            task: "AESTHETIC_DNA_TRANSFER",
            logic: "Image 1 (Identity) -> Apply Style/Lighting/Grain from Image 2 -> Build New Scene.",
            constraint: "No literal copying of objects or layout from Image 2."
        },
        REPLACE: {
            task: "SURGICAL_IDENTITY_SWAP",
            logic: "Image 2 (Original Person) -> Remove -> Replace with Image 1 (New Identity).",
            constraint: "Maintain original pose/perspective of the target being replaced."
        },
        GROUP: {
            task: "SOCIAL_INTEGRATION_SYNC",
            logic: "Image 1 (Subject) -> Integrate into social group in Image 2.",
            key_factor: "Depth-awareness, correct scale, and social occlusion."
        }
    },

    DEVELOPMENT_RULES: {
        CODE_INTEGRITY: "ADDITION ONLY. Never delete or rewrite existing logic. Focus exclusively on the requested mode.",
        STATE_MANAGEMENT: "Ensure all data analysis is saved to 'Persistent Analysis Cache Engine' (PACE).",
        UI_AESTHETICS: "Maintain 'Control-Deck' dark theme (Slate-900/800) with Amber-500 accents."
    }
};

/**
 * EXECUTION DIRECTIVE:
 * 1. Always prioritize biometric consistency.
 * 2. If a new analysis module is added, map it to UnifiedAnalysisData.
 * 3. Use 'gemini-3-pro-preview' for analysis and 'gemini-2.5-flash-image' for HD generation.
 */
`;

/**
 * ============================================================================
 * [VHMS SYSTEM PROTOCOLS v12.70] - EXISTING LOGIC PRESERVED
 * ============================================================================
 */

export interface VHMSModeDirective {
    id: string;
    taskName: string;
    primarySource: string;
    secondarySource: string;
    rules: string[];
    technicalGoal: string;
}

export const VHMS_SYSTEM_PROTOCOLS = {
    GLOBAL_MANDATE: `
        ROLE: You are the Visual Harmony & Morphology System (VHMS) Engine.
        CORE OBJECTIVE: Seamless human-in-scene integration with 1:1 Biometric Fidelity.
        
        STRICT HIERARCHY OF TRUTH:
        1. IDENTITY LOCK: Face structure from [IMAGE 1] is immutable.
        2. PHYSICAL SYNC: Shadows and light MUST match the target environment.
        3. PIXEL INTEGRITY: No hallucinated limbs, no ghosting, no "sticker effect".
        4. TEXTURE MAPPING: Preserve skin pores, fabric weaves, and environmental noise.
    `,

    MODES: {
        GENERATE: {
            id: 'GENERATE',
            taskName: 'CREATIVE_SYNTHESIS',
            primarySource: 'IMAGE 1 (Identity Only)',
            secondarySource: 'USER_PROMPT (World Building)',
            technicalGoal: 'Extract face from [IMAGE 1], synthesize a full body and background from scratch based on text description.',
            rules: [
                'Do not copy background from Image 1.',
                'Generate new outfit if not specified.',
                'Use User Prompt for environment and lighting logic.'
            ]
        } as VHMSModeDirective,

        UPLOAD: {
            id: 'UPLOAD',
            taskName: 'ENVIRONMENTAL_INSERTION',
            primarySource: 'IMAGE 1 (Subject)',
            secondarySource: 'IMAGE 2 (Immutable Background)',
            technicalGoal: 'Insert the subject from [IMAGE 1] into the specific coordinates of [IMAGE 2]. Align light/color to match [IMAGE 2] exactly.',
            rules: [
                'IMAGE 2 pixels are LOCKED. Do not change the room/location.',
                'Subject must cast realistic contact shadows on IMAGE 2 surfaces.',
                'Match the film grain and lens compression of IMAGE 2.'
            ]
        } as VHMSModeDirective,

        REFERENCE: {
            id: 'REFERENCE',
            taskName: 'AESTHETIC_DNA_TRANSFER',
            primarySource: 'IMAGE 1 (Identity)',
            secondarySource: 'IMAGE 2 (Style & Physics Reference)',
            technicalGoal: 'Create a NEW scene. Use [IMAGE 1] for the person. Use [IMAGE 2] ONLY for color palette, lighting quality, and camera characteristics.',
            rules: [
                'Do NOT copy objects or layout from IMAGE 2.',
                'The goal is a new photo that "feels" like it was taken with the same camera/light as IMAGE 2.',
                'Prioritize aesthetic mood over literal content duplication.'
            ]
        } as VHMSModeDirective,

        REPLACE: {
            id: 'REPLACE',
            taskName: 'SURGICAL_IDENTITY_SWAP',
            primarySource: 'IMAGE 1 (New Identity)',
            secondarySource: 'IMAGE 2 (Target Person to Remove)',
            technicalGoal: 'Identify the person in [IMAGE 2], erase them, and reconstruct the area using the identity from [IMAGE 1].',
            rules: [
                'Maintain original pose and perspective of the person being replaced.',
                'Reconstruct occluded background pixels perfectly.',
                'Zero changes allowed to the surrounding environment pixels.'
            ]
        } as VHMSModeDirective,

        /**
         * [GROUP MODE]
         * Fungsi: Integrasi subjek ke dalam interaksi sosial/grup.
         */
        GROUP: {
            id: 'GROUP',
            taskName: 'SOCIAL_INTEGRATION_SYNC',
            primarySource: 'IMAGE 1 (Subject)',
            secondarySource: 'IMAGE 2 (Existing Group)',
            technicalGoal: 'Add the subject from [IMAGE 1] into the group in [IMAGE 2]. Handle depth sorting (who is in front/behind).',
            rules: [
                'Ensure correct scale relative to other humans in the scene.',
                'Correct occlusion: if subject is behind someone, render appropriately.',
                'Match skin tone temperature with other group members.'
            ]
        } as VHMSModeDirective
    }
};

/**
 * UTILS: Prompt Builders (Directly utilizing the Master Protocol)
 */

export const buildReplacePrompt = (options: ReplaceJobOptions, data: MegaAnalysisData): string => {
    const directive = VHMS_SYSTEM_PROTOCOLS.MODES.REPLACE;
    return `
        ${VHMS_SYSTEM_PROTOCOLS.GLOBAL_MANDATE}
        TASK: ${directive.taskName}
        GOAL: ${directive.technicalGoal}
        
        [VAULT_STASIS_PROTOCOL]
        - IMAGE 2 is the FINAL environment. LOCK ALL PIXELS.
        - Operation: Identify target in [IMAGE 2] -> Erase -> Replace with [IMAGE 1].
        - Pose Logic: ${data.unifiedAnalysis.sceneSubjectAnalysis?.poseDescription || "Maintain original skeleton."}
        - Shadow Logic: ${data.unifiedAnalysis.contactShadows?.shadowDirectives || "Render AO on contact."}
    `.trim();
};

export const buildSceneBasedPrompt = (options: UploadJobOptions, data: MegaAnalysisData): string => {
    const directive = VHMS_SYSTEM_PROTOCOLS.MODES.UPLOAD;
    return `
        ${VHMS_SYSTEM_PROTOCOLS.GLOBAL_MANDATE}
        TASK: ${directive.taskName}
        GOAL: ${directive.technicalGoal}
        
        [INSTRUCTION]
        - Subject from [IMAGE 1] is ${options.userPrompt}.
        - Render into the designated area in [IMAGE 2].
        - Match light source: ${data.unifiedAnalysis.photometric?.keyLight?.direction || "Ambient"}.
        - Match grain: ${data.unifiedAnalysis.noiseAnalysis?.grainType || "Digital"}.
    `.trim();
};

export const buildGeneratePrompt = (options: GenerateJobOptions, data: NarrativeIdentityData): string => {
    const directive = VHMS_SYSTEM_PROTOCOLS.MODES.GENERATE;
    return `
        ${VHMS_SYSTEM_PROTOCOLS.GLOBAL_MANDATE}
        TASK: ${directive.taskName}
        GOAL: ${directive.technicalGoal}
        
        [INSTRUCTION]
        - Extract Identity: ${data.physicalDescription}.
        - Build World: ${options.userPrompt}.
        - Aesthetic: ${options.stylePreset}.
    `.trim();
};

export const buildReferencePrompt = (options: ReferenceJobOptions, data: UnifiedAnalysisData): string => {
    const directive = VHMS_SYSTEM_PROTOCOLS.MODES.REFERENCE;
    return `
        ${VHMS_SYSTEM_PROTOCOLS.GLOBAL_MANDATE}
        TASK: ${directive.taskName}
        GOAL: ${directive.technicalGoal}
        
        [DNA_TRANSFER]
        - Use [IMAGE 1] for Face/Head.
        - Use [IMAGE 2] for Style/Lighting/Grain ONLY.
        - Action: ${options.userPrompt}.
    `.trim();
};
