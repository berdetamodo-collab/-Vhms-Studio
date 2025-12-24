import React, { useState, useEffect, useCallback } from 'react';
import type { 
    FileWithPreview, SceneSource, Resolution, AspectRatio, 
    AnalysisModelsState, MegaAnalysisData, HistoryItem, 
    PromptBlueprint, CameraAngle, AppStatus, ApiStatus,
    StylePreset, NarrativeIdentityData, PhysicsPreset,
    UnifiedAnalysisData, AnalysisModelSelection
} from './types';
import { runReplaceJob } from './engines/replaceEngine';
import { runUploadAnalysis, runUploadGeneration } from './engines/uploadEngine';
import { runGroupJob } from './engines/groupEngine';
import { runGenerateJob } from './engines/generateEngine';
import { runReferenceJob } from './engines/referenceEngine.v2';
import { historyService } from './services/historyService';
import { diagnosticService } from './services/diagnosticService';
import { cacheService, generateFileCacheKey } from './services/cacheService';
import { suggestActions } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { FinalPromptDisplay } from './components/FinalPromptDisplay';
import { HistoryView } from './components/HistoryView';
import { Chatbot } from './components/Chatbot';
import { PromptInspector } from './components/PromptInspector';
import { detectImageAspectRatio } from './utils/imageUtils';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'system' | 'ai' | 'success' | 'warn';
}

const CHAT_ROLES = [{ id: 'assistant', name: 'VHMS AI Expert' }, { id: 'creative', name: 'Creative Director' }];
const CHAT_MODELS = [{ id: 'gemini-3-flash-preview', name: 'Flash 3.0 (Fast)' }, { id: 'gemini-3-pro-preview', name: 'Pro 3.0 (Smart)' }];

const App: React.FC = () => {
    const { t, language } = useLanguage();
    
    // --- STATE DEFINITIONS ---
    const [subjectImages, setSubjectImages] = useState<FileWithPreview[]>([]);
    const [sceneImage, setSceneImage] = useState<FileWithPreview | null>(null);
    const [referenceImage, setReferenceImage] = useState<FileWithPreview | null>(null);
    const [outfitImage, setOutfitImage] = useState<FileWithPreview | null>(null);
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [sceneSource, setSceneSource] = useState<SceneSource>('generate');
    const [stylePreset, setStylePreset] = useState<StylePreset>("style_1");
    const [resolution, setResolution] = useState<Resolution>('HD');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isHarmonizationEnabled, setIsHarmonizationEnabled] = useState(true);
    const [isIdentityLockEngaged, setIsIdentityLockEngaged] = useState(false);
    const [customIdentityLock, setCustomIdentityLock] = useState<string | null>(null);
    const [physicsIntensity, setPhysicsIntensity] = useState(0.5);
    const [emotionIntensity, setEmotionIntensity] = useState(0.5);
    const [realismIntensity, setRealismIntensity] = useState(0.8);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>({ pitch: 0, yaw: 0 });
    const [isAngleControlledByPrompt, setIsAngleControlledByPrompt] = useState(true);
    const [isSceneHumanDetected, setIsSceneHumanDetected] = useState(false);
    const [appStatus, setAppStatus] = useState<AppStatus>('IDLE');
    const [apiStatus, setApiStatus] = useState<ApiStatus>('IDLE');
    const [statusMessage, setStatusMessage] = useState("");
    const [generationProgress, setGenerationProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [megaAnalysisData, setMegaAnalysisData] = useState<MegaAnalysisData | null>(null);
    const [activeBlueprint, setActiveBlueprint] = useState<PromptBlueprint | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const [activeView, setActiveView] = useState<'generation' | 'history' | 'chat'>('generation');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    
    const [analysisModels, setAnalysisModels] = useState<AnalysisModelsState>({
        subject: 'Pro', scene: 'Pro', vfx: 'Fast', pose: 'Pro',
        shadow: 'Fast', perspective: 'Pro', photometric: 'Pro',
        depthMap: 'Fast', noise: 'Fast'
    });

    const [isScanningScene, setIsScanningScene] = useState(false);
    const [physicsPreset, setPhysicsPreset] = useState<PhysicsPreset>({ wind: 'none', fluid: 'none', temperature: 'normal', particles: 'clean' });
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [isSuggestingActions, setIsSuggestingActions] = useState(false);
    const [actionSuggestions, setActionSuggestions] = useState<string[]>([]);

    const appendLog = useCallback((message: string, type: LogEntry['type'] = 'system') => {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ms = new Date().getMilliseconds().toString().padStart(3, '0');
        setLogEntries(prev => [...prev, { timestamp: `${time}.${ms}`, message, type }].slice(-50));
    }, []);

    const handleSubjectDrop = (file: FileWithPreview) => {
        setSubjectImages(prev => [...prev, file].slice(0, 5));
        appendLog(`Subject View Added: ${file.name}. Total: ${subjectImages.length + 1} perspectives.`);
    };

    const handleClearSubjects = () => setSubjectImages([]);

    const handleGlobalModelChange = useCallback((value: AnalysisModelSelection) => {
        setAnalysisModels(prev => {
            const newState = { ...prev };
            (Object.keys(newState) as Array<keyof AnalysisModelsState>).forEach(key => {
                newState[key] = value;
            });
            return newState;
        });
        appendLog(`VHMS Multi-Engine updated to ${value.toUpperCase()} Precision.`, 'system');
    }, [appendLog]);

    const handleSuggestActions = async () => {
        if (subjectImages.length === 0) {
            setError(language === 'id' ? "Upload setidaknya satu gambar subjek!" : "Upload at least one subject image!");
            return;
        }
        setIsSuggestingActions(true);
        appendLog("Brainstorming contextual actions...");
        try {
            const suggestions = await suggestActions(subjectImages, sceneImage);
            setActionSuggestions(suggestions);
            appendLog(`Matrix brainstorm complete: ${suggestions.length} scenarios.`, "success");
        } catch (e) {
            appendLog("Failed to analyze multi-subject context.", "warn");
        } finally {
            setIsSuggestingActions(false);
        }
    };

    useEffect(() => {
        const syncAspectRatio = async () => {
            if (sceneImage && ['upload', 'replace', 'group'].includes(sceneSource)) {
                const detectedRatio = await detectImageAspectRatio(sceneImage);
                setAspectRatio(detectedRatio);
            }
        };
        syncAspectRatio();
    }, [sceneImage, sceneSource]);

    useEffect(() => {
        const loadInitialHistory = async () => {
            const items = await historyService.loadHistory();
            setHistory(items);
        };
        loadInitialHistory();
    }, []);

    const onProgressUpdate = (status: AppStatus, message?: string) => {
        setAppStatus(status);
        if (message) {
            setStatusMessage(message);
            appendLog(message, status === 'ERROR' ? 'warn' : 'system');
        }
        const statusMap: Record<string, number> = {
            'IDLE': 0, 'INITIALIZING': 5, 'ANALYZING_PRIMARY': 20, 
            'AWAITING_PLACEMENT': 40, 'GENERATING_MASK': 50, 
            'BUILDING_PROMPT': 60, 'GENERATING_IMAGE': 80, 
            'HARMONIZING': 95, 'DONE': 100
        };
        setGenerationProgress(statusMap[status] || 0);
    };

    const handleStartGeneration = async () => {
        if (subjectImages.length === 0) { setError("Gambar subjek wajib diunggah."); return; }
        setError(null);
        setApiStatus('PENDING');
        appendLog(`Starting MPIM generation [${subjectImages.length} views]`);
        
        try {
            let finalImageUrl = "";
            let generatedPromptText = "";
            let finalAnalysis: MegaAnalysisData | null = null;

            if (sceneSource === 'replace') {
                if (!sceneImage) throw new Error("Pilih scene latar belakang.");
                const result = await runReplaceJob({
                    subjectImages, sceneImage, outfitImage, userPrompt: prompt, resolution, aspectRatio,
                    negativePrompt, analysisModels, isIdentityLockEngaged, customIdentityLock,
                    isHarmonizationEnabled, physicsIntensity, emotionIntensity,
                    onProgressUpdate, onPromptGenerated: (p) => { generatedPromptText = p; },
                    isSceneHumanDetected
                });
                finalImageUrl = result.imageUrl;
                finalAnalysis = result.analysisData;
            } else if (sceneSource === 'generate') {
                const result = await runGenerateJob({
                    subjectImages, outfitImage, userPrompt: prompt, stylePreset, resolution, aspectRatio,
                    negativePrompt, analysisModels, isIdentityLockEngaged, customIdentityLock,
                    isHarmonizationEnabled, realismIntensity, cameraAngle, isAngleControlledByPrompt,
                    physicsPreset,
                    onProgressUpdate, onPromptGenerated: (p) => { generatedPromptText = p; }
                });
                finalImageUrl = result.imageUrl;
                finalAnalysis = { unifiedAnalysis: {}, poseAndShadow: {} };
            } else if (sceneSource === 'reference') {
                if (!referenceImage) throw new Error("Pilih gambar referensi gaya.");
                const result = await runReferenceJob({
                    subjectBlobs: subjectImages, referenceFiles: [referenceImage], outfitImage,
                    userPrompt: prompt, resolution, aspectRatio, negativePrompt, analysisModels,
                    isHarmonizationEnabled, realismIntensity, physicsIntensity, emotionIntensity,
                    onProgressUpdate, onPromptGenerated: (p) => { generatedPromptText = p; }
                });
                finalImageUrl = result.imageUrl;
                finalAnalysis = { unifiedAnalysis: result.analysisData, poseAndShadow: {} };
            } else {
                // Default fallback to upload logic if not matched
                if (!sceneImage) throw new Error("Pilih gambar latar belakang.");
                const analysis = await runUploadAnalysis({
                    subjectImages, sceneImage, outfitImage, userPrompt: prompt, resolution, aspectRatio,
                    negativePrompt, analysisModels, isIdentityLockEngaged, customIdentityLock,
                    isHarmonizationEnabled, physicsIntensity, emotionIntensity,
                    onProgressUpdate, onPromptGenerated: () => {}, backgroundSubjectMode: 'place', interactionMask: null
                });
                const defaultBox = { x: 100, y: 100, width: 400, height: 600 };
                const result = await runUploadGeneration({
                    subjectImages, sceneImage, outfitImage, userPrompt: prompt, resolution, aspectRatio,
                    negativePrompt, analysisModels, isIdentityLockEngaged, customIdentityLock,
                    isHarmonizationEnabled, physicsIntensity, emotionIntensity,
                    onProgressUpdate, onPromptGenerated: (p) => { generatedPromptText = p; },
                    backgroundSubjectMode: 'place', interactionMask: null
                }, analysis.analysisData, defaultBox);
                finalImageUrl = result.imageUrl;
                finalAnalysis = analysis.analysisData;
            }

            setOutputImage(finalImageUrl);
            setMegaAnalysisData(finalAnalysis);
            const blueprint: PromptBlueprint = {
                userPrompt: prompt,
                finalPromptText: generatedPromptText,
                analysisData: finalAnalysis,
                configuration: { sceneSource, resolution, aspectRatio, stylePreset, isHarmonizationEnabled },
                inputMetadata: { subjectImageNames: subjectImages.map(s => s.name) }
            };
            setActiveBlueprint(blueprint);
            const historyItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                outputImage: finalImageUrl,
                inputs: { subjectImages, sceneImage, referenceImage, outfitImage, prompt, negativePrompt, sceneSource, stylePreset, resolution, aspectRatio, customIdentityLock },
                blueprint
            };
            await historyService.saveItem(historyItem);
            setHistory(prev => [historyItem, ...prev]);
            onProgressUpdate('DONE');
            setApiStatus('SUCCESS');
        } catch (e: any) {
            setError(e.message || "Terjadi kesalahan sistem.");
            onProgressUpdate('ERROR', e.message);
            setApiStatus('ERROR');
        }
    };

    const handleRestoreHistory = (item: HistoryItem) => {
        setSubjectImages(item.inputs.subjectImages);
        setSceneImage(item.inputs.sceneImage);
        setReferenceImage(item.inputs.referenceImage);
        setOutfitImage(item.inputs.outfitImage);
        setPrompt(item.inputs.prompt);
        setNegativePrompt(item.inputs.negativePrompt);
        setSceneSource(item.inputs.sceneSource);
        setStylePreset(item.inputs.stylePreset);
        setResolution(item.inputs.resolution);
        setAspectRatio(item.inputs.aspectRatio);
        setCustomIdentityLock(item.inputs.customIdentityLock);
        setOutputImage(item.outputImage);
        setActiveView('generation');
        appendLog(`Restored history [${item.id}]`);
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
            <Sidebar 
                activeView={activeView} onNavigate={setActiveView} isOpen={isSidebarOpen} 
                logEntries={logEntries} onRunDiagnostic={() => diagnosticService.runSimulatedTest(sceneSource, appendLog, onProgressUpdate)} apiStatus={apiStatus}
            />
            
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
                {/* Global Header */}
                <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-xl shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all active:scale-90 border border-transparent hover:border-slate-700 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">{activeView}</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">VHMS Integrated Workflow</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700">
                           <div className={`w-2 h-2 rounded-full ${apiStatus === 'SUCCESS' ? 'bg-green-500' : apiStatus === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System {apiStatus}</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
                    {/* Background Ambience */}
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="max-w-[1600px] mx-auto">
                        {activeView === 'generation' ? (
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                {/* Left Deck: Assets & Logic */}
                                <div className="xl:col-span-7 2xl:col-span-8 space-y-8">
                                    <InputPanel 
                                        subjectImages={subjectImages} setSubjectImage={handleSubjectDrop} onClearSubjects={handleClearSubjects}
                                        sceneImage={sceneImage} setSceneImage={setSceneImage}
                                        referenceImage={referenceImage} setReferenceImage={setReferenceImage}
                                        outfitImage={outfitImage} setOutfitImage={setOutfitImage}
                                        prompt={prompt} setPrompt={setPrompt}
                                        negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
                                        sceneSource={sceneSource} setSceneSource={setSceneSource}
                                        stylePreset={stylePreset} setStylePreset={setStylePreset}
                                        resolution={resolution} setResolution={setResolution}
                                        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                                        isHarmonizationEnabled={isHarmonizationEnabled} setIsHarmonizationEnabled={setIsHarmonizationEnabled}
                                        onOpenIdentityModal={() => {}} 
                                        customIdentityLock={customIdentityLock}
                                        onSuggestStyle={async () => {}} isSuggestingStyle={false}
                                        onSuggestActions={handleSuggestActions} isSuggestingActions={isSuggestingActions}
                                        actionSuggestions={actionSuggestions} setActionSuggestions={setActionSuggestions}
                                        onClearAll={() => {}} onOpenMaskEditor={() => {}}
                                        onOpenCropModal={() => {}} onImportBlueprint={() => {}}
                                        megaAnalysisData={megaAnalysisData}
                                        analysisModels={analysisModels} onModelChange={handleGlobalModelChange}
                                        isIdentityLockEngaged={isIdentityLockEngaged} setIsIdentityLockEngaged={setIsIdentityLockEngaged}
                                        preservation={{ shape: 0.8, color: 0.8, texture: 0.8 }} setPreservation={() => {}}
                                        realismIntensity={realismIntensity} setRealismIntensity={setRealismIntensity}
                                        physicsIntensity={physicsIntensity} setPhysicsIntensity={setPhysicsIntensity}
                                        emotionIntensity={emotionIntensity} setEmotionIntensity={setEmotionIntensity}
                                        cameraAngle={cameraAngle} setCameraAngle={setCameraAngle}
                                        isAngleControlledByPrompt={isAngleControlledByPrompt} setIsAngleControlledByPrompt={setIsAngleControlledByPrompt}
                                        physicsPreset={physicsPreset} setPhysicsPreset={setPhysicsPreset}
                                        isAutoPlacementEnabled={true} setIsAutoPlacementEnabled={() => {}}
                                        backgroundSubjectMode="place" setBackgroundSubjectMode={() => {}}
                                        isSceneHumanDetected={isSceneHumanDetected} isScanningScene={isScanningScene}
                                    />
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <FinalPromptDisplay blueprint={activeBlueprint} />
                                    </div>
                                </div>

                                {/* Right Deck: Visualization & Control */}
                                <div className="xl:col-span-5 2xl:col-span-4 sticky top-8">
                                    <OutputPanel 
                                        outputImage={outputImage} appStatus={appStatus} statusMessage={statusMessage}
                                        onStartGeneration={handleStartGeneration} isBusy={apiStatus === 'PENDING'}
                                        error={error} onStartEditing={() => {}}
                                        unifiedData={megaAnalysisData?.unifiedAnalysis || null}
                                        resolution={resolution} analysisModels={analysisModels}
                                        onModelChange={handleGlobalModelChange} sceneSource={sceneSource}
                                        generationProgress={generationProgress} onOpenInspector={() => setIsInspectorOpen(true)}
                                    />
                                </div>
                            </div>
                        ) : activeView === 'history' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <HistoryView history={history} onRestore={handleRestoreHistory} onInspect={() => setIsInspectorOpen(true)} />
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] animate-in zoom-in-95 duration-300">
                                <Chatbot history={[]} onSend={() => {}} roles={CHAT_ROLES} models={CHAT_MODELS} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isInspectorOpen && (
                <PromptInspector 
                    isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} 
                    data={megaAnalysisData?.unifiedAnalysis || null} 
                />
            )}
        </div>
    );
};

export default App;