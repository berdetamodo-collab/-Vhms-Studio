
export type Language = 'en' | 'id';

export interface FileWithPreview extends File {
    preview: string;
}

export type SceneSource = 'generate' | 'upload' | 'reference' | 'replace' | 'group';
export type Resolution = 'HD' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type AppStatus = 'IDLE' | 'INITIALIZING' | 'ANALYZING_PRIMARY' | 'STARTING' | 'EXTRACTING_STYLE_CACHE_MISS' | 'EXTRACTING_STYLE_CACHE_HIT' | 'BUILDING_PROMPT' | 'GENERATING_MASK' | 'AWAITING_PLACEMENT' | 'GENERATING_IMAGE' | 'HARMONIZING' | 'DONE' | 'ERROR' | 'REMOVING_SUBJECT' | 'COMPOSITING_NEW_SUBJECT' | 'MERGING_STYLES' | 'GENERATING' | 'FINAL_BLENDING' | 'EVALUATING' | 'VERIFYING_PHYSICS' | 'ENHANCING_PROMPT';
export type ApiStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR';
export type StylePreset = string;
export type AnalysisModelSelection = 'Fast' | 'Pro';

export interface AnalysisModelsState {
    subject: AnalysisModelSelection;
    scene: AnalysisModelSelection;
    vfx: AnalysisModelSelection;
    pose: AnalysisModelSelection;
    shadow: AnalysisModelSelection;
    perspective: AnalysisModelSelection;
    photometric: AnalysisModelSelection;
    depthMap: AnalysisModelSelection;
    noise: AnalysisModelSelection;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Preservation {
    shape: number;
    color: number;
    texture: number;
}

export interface CameraAngle {
    pitch: number;
    yaw: number;
}

export interface PhysicsPreset {
    wind: 'none' | 'light' | 'strong';
    fluid: 'none' | 'water' | 'oil';
    temperature: 'normal' | 'hot' | 'cold';
    particles: 'clean' | 'dusty' | 'smoky';
}

export interface PerspectiveAnalysisData {
    recommendedSubjectScale: number;
    vanishingPoints?: Array<{ x: number, y: number }>;
    horizonLineY?: number; 
    groundPlaneTilt?: number;
    floorDepthZones?: Array<{
        y_min: number;
        y_max: number;
        depthLabel: 'foreground' | 'midground' | 'background';
    }>;
}

export interface DepthAnalysis {
    occlusionSuggestion?: string;
    occlusionMaskPrompt?: string;
}

export interface EnvironmentalOcclusion {
    hasObstructingObjects: boolean;
    occlusionSuggestion?: string;
    occlusionMaskPrompt?: string;
}

export interface ReflectiveSurfaceAnalysis {
    hasReflectiveSurfaces: boolean;
    surfaceType?: 'water' | 'mirror' | 'glass' | 'polished_floor' | 'wet_pavement';
    reflectivityIntensity: number; 
    surfaceRoughness: number; 
    reflectionDirectives?: string;
    surfaceCoordinates?: { y_start: number, y_end: number };
}

export interface ContactShadowAnalysis {
    hasShadowOpportunity: boolean;
    contactPoints: Array<{ x: number, y: number, description: string }>;
    shadowPhysics: {
        ambientOcclusionDepth: number;
        falloffRange: number;
        softness: number;
        colorBias: string;
    };
    shadowDirectives: string;
}

export interface LensDistortionAnalysis {
    distortionType: 'barrel' | 'pincushion' | 'none';
    intensity: number; 
    chromaticAberration: {
        present: boolean;
        fringeColor: string;
    };
    edgeSoftness: number;
    calibrationDirectives: string;
}

export interface SkinToneAnalysis {
    hasSkinReference: boolean;
    chromaticProfile: {
        melaninLevel: number;
        undertone: 'warm' | 'cool' | 'neutral';
        ambientBleedFactor: number;
    };
    surfaceScattering: {
        intensity: number;
        glowColor: string;
        activeAreas: string[];
    };
    integrationDirectives: string;
}

export interface SceneSubjectAnalysis {
    isHumanSubjectPresent: boolean;
    boundingBox?: { x_min: number, y_min: number, x_max: number, y_max: number };
    poseDescription?: string; 
}

export interface InteractionAnalysis {
    hasInteractionOpportunity: boolean;
    detectedAnchors: Array<{
        objectType: string;
        coordinates: { x: number, y: number };
        interactionType: 'support' | 'lean' | 'touch' | 'occlude';
    }>;
    optimalInteractionPose: string;
    physicsDirectives: string;
}

export interface ClothPhysicsAnalysis {
    detectedFabricType: string; 
    foldDensity: 'low' | 'medium' | 'high';
    draperyLogic: string; 
    tensionPoints: string[]; 
    gravitationalInfluence: number; 
}

export interface HairDynamicsAnalysis {
    texture: 'straight' | 'wavy' | 'curly' | 'coily';
    strandDefinition: 'low' | 'medium' | 'high';
    atmosphericDisplacement: {
        windDirection: string;
        intensity: number; 
    };
    specularDirectives: string; 
}

export interface RelightingAnalysis {
    primaryLightSource: {
        type: 'directional' | 'ambient' | 'spot' | 'point';
        normalizedPosition: { x: number, y: number };
        intensity: number;
        colorTemperature: string;
    };
    rimLightingRequirement: boolean;
    rimLightColor: string;
    globalIlluminationBleed: {
        active: boolean;
        dominantColor: string;
        intensity: number;
    };
}

export interface PhotometricAnalysis {
    globalMood: string;
    keyLight: {
        direction: string;
        quality: string;
        colorTemperature: string;
    };
    shadowQuality: string;
    contrastLevel: string;
    relighting?: RelightingAnalysis;
}

export interface ColorAnalysis {
    temperature: string;
    mood: string;
    dominantHues: string[];
}

export interface CompositionAnalysis {
    depthOfField: string;
    subjectInteraction: string;
}

export interface AtmosphereAnalysis {
    genre: string;
    timeOfDay: string;
    weather: string;
}

export interface NoiseAnalysis {
    grainType: string;
    intensity: string;
    structureDescription: string;
}

export interface VFXSuggestions {
    effects: string[];
    intensity: number;
}

export interface GazeAnalysis {
    direction: string;
    target?: string;
}

export interface FACSAnalysis {
    musculatureDescription: string;
    actionUnits?: number[];
}

export interface UnifiedAnalysisData {
    photometric?: PhotometricAnalysis;
    color?: ColorAnalysis;
    composition?: CompositionAnalysis;
    atmosphere?: AtmosphereAnalysis;
    noiseAnalysis?: NoiseAnalysis;
    depthAnalysis?: DepthAnalysis;
    occlusion?: EnvironmentalOcclusion;
    reflectiveSurfaces?: ReflectiveSurfaceAnalysis;
    contactShadows?: ContactShadowAnalysis;
    skinToneAnalysis?: SkinToneAnalysis;
    lensDistortion?: LensDistortionAnalysis;
    vfx?: VFXSuggestions;
    sceneSubjectAnalysis?: SceneSubjectAnalysis;
    perspective?: PerspectiveAnalysisData;
    interaction?: InteractionAnalysis;
    clothPhysics?: ClothPhysicsAnalysis;
    hairDynamics?: HairDynamicsAnalysis; 
    gazeAnalysis?: GazeAnalysis;
    facsAnalysis?: FACSAnalysis;
    referenceAnalysis?: { artisticStyle: string };
}

export interface MegaAnalysisData {
    unifiedAnalysis: UnifiedAnalysisData;
    poseAndShadow?: {
        pose?: {
            subjectCropBox: { x_min: number, y_min: number, x_max: number, y_max: number };
        }
    };
}

export interface NarrativeIdentityData {
    physicalDescription: string;
    facialFeatures: string;
}

export interface PromptBlueprint {
    userPrompt: string;
    finalPromptText: string;
    analysisData: any;
    configuration: {
        sceneSource: SceneSource;
        resolution: Resolution;
        aspectRatio: AspectRatio;
        stylePreset?: StylePreset;
        isHarmonizationEnabled: boolean;
        realismIntensity?: number;
    };
    inputMetadata: {
        subjectImageNames: string[]; // [UPDATED v12.51]
        sceneImageName?: string;
        referenceImageName?: string;
        outfitImageName?: string;
    };
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    outputImage: string;
    inputs: {
        subjectImages: FileWithPreview[]; // [UPDATED v12.51]
        sceneImage: FileWithPreview | null;
        referenceImage: FileWithPreview | null;
        outfitImage: FileWithPreview | null;
        prompt: string;
        negativePrompt: string;
        sceneSource: SceneSource;
        stylePreset: StylePreset;
        resolution: Resolution;
        aspectRatio: AspectRatio;
        customIdentityLock: string | null;
    };
    blueprint: PromptBlueprint;
}

export interface VerificationResult {
    subject: { valid: boolean; message: string; type?: 'info' | 'success' };
    scene: { valid: boolean; message: string; type?: 'info' | 'success' };
    outfit: { valid: boolean; message: string; type?: 'info' | 'success' };
    prompt: { valid: boolean; message: string; type?: 'info' | 'success' };
    promptSnippet: string;
    overall: { valid: boolean; message: string };
}

export type ChatModel = string;
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    image?: string;
    imageUrl?: string;
    isLoading?: boolean;
    groundingChunks?: Array<{ web: { uri: string; title: string } }>;
}

export interface ChatbotRole {
    id: string;
    name: string;
}

export interface CaptionResponse {
    caption: string;
    hashtags: string[];
}

export interface StyleEmbedding {
    id?: string;
    palette: string[];
    lighting: any;
    lens: any;
    texture_signatures: any;
    raw?: any;
}

export interface ReplaceJobOptions {
    subjectImages: FileWithPreview[]; // [UPDATED v12.51]
    sceneImage: FileWithPreview;
    outfitImage: FileWithPreview | null;
    userPrompt: string;
    resolution: Resolution;
    aspectRatio: AspectRatio;
    negativePrompt: string;
    analysisModels: AnalysisModelsState;
    isIdentityLockEngaged: boolean;
    customIdentityLock: string | null;
    isHarmonizationEnabled: boolean;
    physicsIntensity: number;
    emotionIntensity: number;
    onProgressUpdate: (status: AppStatus, message?: string) => void;
    onPromptGenerated: (prompt: string) => void;
    isSceneHumanDetected: boolean;
}

export interface UploadJobOptions {
    subjectImages: FileWithPreview[]; // [UPDATED v12.51]
    sceneImage: FileWithPreview;
    outfitImage: FileWithPreview | null;
    userPrompt: string;
    resolution: Resolution;
    aspectRatio: AspectRatio;
    negativePrompt: string;
    analysisModels: AnalysisModelsState;
    isIdentityLockEngaged: boolean;
    customIdentityLock: string | null;
    isHarmonizationEnabled: boolean;
    physicsIntensity: number;
    emotionIntensity: number;
    onProgressUpdate: (status: AppStatus, message?: string) => void;
    onPromptGenerated: (prompt: string) => void;
    backgroundSubjectMode: 'place' | 'add';
    interactionMask: string | null;
}

export interface GroupJobOptions extends UploadJobOptions {}

export interface GenerateJobOptions {
    subjectImages: FileWithPreview[]; // [UPDATED v12.51]
    outfitImage: FileWithPreview | null;
    userPrompt: string;
    stylePreset: StylePreset;
    resolution: Resolution;
    aspectRatio: AspectRatio;
    negativePrompt: string;
    analysisModels: AnalysisModelsState;
    isIdentityLockEngaged: boolean;
    customIdentityLock: string | null;
    isHarmonizationEnabled: boolean;
    realismIntensity: number;
    cameraAngle: CameraAngle;
    isAngleControlledByPrompt: boolean;
    physicsPreset: PhysicsPreset;
    onProgressUpdate: (status: AppStatus, message?: string) => void;
    onPromptGenerated: (prompt: string) => void;
}

export interface ReferenceJobOptions {
    subjectBlobs: FileWithPreview[]; // [UPDATED v12.51]
    referenceFiles: FileWithPreview[];
    outfitImage: FileWithPreview | null;
    userPrompt: string;
    resolution: Resolution;
    aspectRatio: AspectRatio;
    negativePrompt: string;
    analysisModels: AnalysisModelsState;
    isHarmonizationEnabled: boolean;
    realismIntensity: number;
    physicsIntensity: number;
    emotionIntensity: number;
    onProgressUpdate: (status: AppStatus, message?: string) => void;
    onPromptGenerated: (prompt: string) => void;
}
