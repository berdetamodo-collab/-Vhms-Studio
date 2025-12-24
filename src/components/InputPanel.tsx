import React, { useState } from 'react';
import type { 
    FileWithPreview, SceneSource, Resolution, AspectRatio, 
    AnalysisModelsState, MegaAnalysisData, Preservation, 
    CameraAngle, PhysicsPreset 
} from '../types';
import { Card } from './common/Card';
import { DropZone } from './common/DropZone';
import { InfoCircleIcon, PaletteIcon, MagicWandIcon, BrushIcon, LayersIcon, ShieldCheckIcon, CubeIcon, CameraIcon, RefreshIcon, XCircleIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { StyleSelector } from './StyleSelector';
import { ModelConfiguration } from './ModelConfiguration';
import { CameraAngleControl } from './CameraAngleControl';

interface InputPanelProps {
    subjectImages: FileWithPreview[];
    setSubjectImage: (file: FileWithPreview) => void;
    onClearSubjects: () => void;
    sceneImage: FileWithPreview | null;
    setSceneImage: (file: FileWithPreview | null) => void;
    referenceImage: FileWithPreview | null;
    setReferenceImage: (file: FileWithPreview | null) => void;
    outfitImage: FileWithPreview | null;
    setOutfitImage: (file: FileWithPreview | null) => void;
    prompt: string;
    setPrompt: (p: string) => void;
    negativePrompt: string;
    setNegativePrompt: (p: string) => void;
    sceneSource: SceneSource;
    setSceneSource: (s: SceneSource) => void;
    stylePreset: string;
    setStylePreset: (s: string) => void;
    resolution: Resolution;
    setResolution: (r: Resolution) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (a: AspectRatio) => void;
    isHarmonizationEnabled: boolean;
    setIsHarmonizationEnabled: (v: boolean) => void;
    onOpenIdentityModal: () => void;
    customIdentityLock: string | null;
    onSuggestStyle: () => Promise<void>;
    isSuggestingStyle: boolean;
    onSuggestActions: () => Promise<void>;
    isSuggestingActions: boolean;
    actionSuggestions: string[];
    setActionSuggestions: (s: string[]) => void;
    onClearAll: () => void;
    onOpenMaskEditor: () => void;
    onOpenCropModal: () => void;
    onImportBlueprint: () => void;
    megaAnalysisData: MegaAnalysisData | null;
    analysisModels: AnalysisModelsState;
    onModelChange: (module: keyof AnalysisModelsState, value: any) => void;
    isIdentityLockEngaged: boolean;
    setIsIdentityLockEngaged: (v: boolean) => void;
    preservation: Preservation;
    setPreservation: (p: Preservation) => void;
    realismIntensity: number;
    setRealismIntensity: (v: number) => void;
    physicsIntensity: number;
    setPhysicsIntensity: (v: number) => void;
    emotionIntensity: number;
    setEmotionIntensity: (v: number) => void;
    cameraAngle: CameraAngle;
    setCameraAngle: (a: CameraAngle) => void;
    isAngleControlledByPrompt: boolean;
    setIsAngleControlledByPrompt: (v: boolean) => void;
    physicsPreset: PhysicsPreset;
    setPhysicsPreset: (p: PhysicsPreset) => void;
    isAutoPlacementEnabled: boolean;
    setIsAutoPlacementEnabled: (v: boolean) => void;
    backgroundSubjectMode: string;
    setBackgroundSubjectMode: (m: string) => void;
    isSceneHumanDetected: boolean;
    isScanningScene: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = (props) => {
    const {
        subjectImages, setSubjectImage, onClearSubjects,
        sceneImage, setSceneImage,
        referenceImage, setReferenceImage,
        outfitImage, setOutfitImage,
        prompt, setPrompt,
        sceneSource, setSceneSource,
        stylePreset, setStylePreset,
        resolution, setResolution,
        aspectRatio, setAspectRatio,
        onSuggestActions, isSuggestingActions,
        actionSuggestions,
        onOpenIdentityModal, 
        onOpenCropModal,
        analysisModels,
        onModelChange,
        isIdentityLockEngaged,
        cameraAngle, setCameraAngle,
        isAngleControlledByPrompt, setIsAngleControlledByPrompt,
        isScanningScene
    } = props;

    const { t } = useLanguage();
    const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);
    const isRatioLocked = ['upload', 'replace', 'group'].includes(sceneSource);

    return (
        <Card title={t.inputPanelTitle} titleIcon={<LayersIcon className="w-5 h-5 text-amber-500"/>} tooltip={t.inputPanelTooltip} className="shadow-2xl border-slate-800/50">
            <div className="flex flex-col gap-8">
                
                {/* 1. SCENE SOURCE SELECTOR */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.sceneMode}</label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {(['generate', 'upload', 'reference', 'replace', 'group'] as SceneSource[]).map(mode => (
                            <button 
                                key={mode} 
                                onClick={() => setSceneSource(mode)} 
                                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 ${
                                    sceneSource === mode 
                                    ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_4px_12px_rgba(245,158,11,0.2)]' 
                                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. ASSET MATRIX (DropZones) */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-5 bg-slate-950/40 rounded-2xl border border-slate-800/60 relative overflow-hidden group">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
                    
                    {/* Subject Multi-View */}
                    <div className="relative group/drop h-full flex flex-col items-center">
                        <DropZone 
                            file={subjectImages.length > 0 ? subjectImages[subjectImages.length - 1] : null} 
                            onDrop={setSubjectImage} 
                            title={t.dropSubject} 
                            description={t.dropSubjectDesc}
                        >
                            {subjectImages.length > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); onClearSubjects(); }} className="absolute -top-1.5 -right-1.5 bg-red-600/90 text-white rounded-full p-1 shadow-lg hover:bg-red-500 transition-colors z-40">
                                    <XCircleIcon className="w-4 h-4"/>
                                </button>
                            )}
                        </DropZone>
                        {subjectImages.length > 0 && (
                            <div className="flex gap-1 mt-2.5">
                                {subjectImages.map((_, idx) => (
                                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Scene/Ref Slot */}
                    {['upload', 'replace', 'group'].includes(sceneSource) ? (
                        <DropZone file={sceneImage} onDrop={setSceneImage} title={t.dropScene} description={t.dropSceneDesc} />
                    ) : sceneSource === 'reference' ? (
                        <DropZone file={referenceImage} onDrop={setReferenceImage} title={t.dropRef} description={t.dropRefDesc} />
                    ) : <div className="border border-slate-800/50 rounded-full border-dashed flex items-center justify-center opacity-20"><InfoCircleIcon className="w-6 h-6"/></div>}
                    
                    {/* Outfit Slot */}
                    <DropZone file={outfitImage} onDrop={setOutfitImage} title={t.dropOutfit} description={t.dropOutfitDesc}>
                        <button onClick={onOpenCropModal} className="p-2 bg-slate-900/90 rounded-full hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-500 transition-all shadow-md">
                            <BrushIcon className="w-4 h-4"/>
                        </button>
                    </DropZone>
                    
                    {/* Identity Lock Controller */}
                    <div className="flex flex-col items-center justify-center gap-3">
                         <button 
                            onClick={onOpenIdentityModal} 
                            className={`p-4 rounded-full border-2 border-dashed transition-all active:scale-90 ${
                                isIdentityLockEngaged 
                                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-400'
                            }`}
                         >
                            <ShieldCheckIcon className="w-7 h-7"/>
                         </button>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Anchor</span>
                    </div>
                </section>

                {/* 3. PROMPT & LOGIC */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.promptLabel}</label>
                        </div>
                        <button 
                            onClick={onSuggestActions} 
                            disabled={isSuggestingActions} 
                            className="text-[10px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1.5 disabled:opacity-50 group px-3 py-1.5 rounded-lg hover:bg-amber-500/5 transition-all"
                        >
                            {isSuggestingActions ? <RefreshIcon className="w-3.5 h-3.5 animate-spin"/> : <MagicWandIcon className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform"/>}
                            {t.autoDescribe}
                        </button>
                    </div>
                    <div className="relative">
                        <textarea 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder={t.promptPlaceholderUpload} 
                            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none h-32 resize-none transition-all shadow-inner" 
                        />
                        {actionSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in duration-500">
                                {actionSuggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setPrompt(s)} 
                                        className="text-[10px] font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-all hover:scale-105"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. CONFIGURATION DECK */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Visual Style & Optics */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.stylePreset}</label>
                            {sceneSource === 'generate' ? (
                                <button onClick={() => setIsStyleSelectorOpen(true)} className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-left flex justify-between items-center hover:border-slate-600 transition-all group active:scale-[0.98] shadow-lg">
                                    <span className="text-sm font-bold text-slate-300 truncate">{stylePreset}</span>
                                    <PaletteIcon className="w-5 h-5 text-slate-600 group-hover:text-amber-500 transition-colors"/>
                                </button>
                            ) : (
                                <div className="w-full bg-slate-800/20 border border-slate-800/40 rounded-xl p-3.5 flex justify-between items-center opacity-40 grayscale cursor-not-allowed">
                                    <span className="text-[11px] text-slate-600 font-black uppercase tracking-tighter italic">Physics Driven Styles</span>
                                    <ShieldCheckIcon className="w-5 h-5 text-slate-700"/>
                                </div>
                            )}
                        </div>

                        <ModelConfiguration analysisModels={analysisModels} onModelChange={onModelChange} isDisabled={isScanningScene} sceneSource={sceneSource} />
                    </div>
                    
                    {/* Resolution & Perspective */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output Scale & Frame</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="w-full appearance-none bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-black text-slate-400 focus:outline-none focus:border-amber-500 focus:text-white transition-all shadow-md uppercase">
                                        <option value="HD">HD Ready</option><option value="2K">2K Quad HD</option><option value="4K">4K Ultra HD</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none"/>
                                </div>
                                <div className="relative">
                                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} disabled={isRatioLocked} className={`w-full appearance-none h-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-black text-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-md ${isRatioLocked ? 'opacity-50 grayscale cursor-not-allowed bg-slate-950/50' : 'focus:text-white'}`}>
                                        {isRatioLocked ? <option value={aspectRatio}>{aspectRatio} AUTO</option> : <><option value="1:1">1:1 Square</option><option value="16:9">16:9 Wide</option><option value="9:16">9:16 Port</option></>}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none"/>
                                    {isRatioLocked && <div className="absolute -top-3 right-2 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800"><span className="text-[7px] font-black text-amber-500/80 uppercase">Locked</span></div>}
                                </div>
                            </div>
                        </div>

                        {sceneSource === 'generate' && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 flex flex-col items-center gap-4 group">
                                <CameraAngleControl angle={cameraAngle} setAngle={setCameraAngle} isControlledByPrompt={isAngleControlledByPrompt} onVisualOverride={() => setIsAngleControlledByPrompt(false)} size={120} />
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-full border border-slate-800 shadow-inner group-hover:border-amber-500/30 transition-colors">
                                    <input type="checkbox" id="angle-prompt-control" checked={isAngleControlledByPrompt} onChange={(e) => setIsAngleControlledByPrompt(e.target.checked)} className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer" />
                                    <label htmlFor="angle-prompt-control" className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest cursor-pointer transition-colors">Prompt-Sync Angle</label>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {isStyleSelectorOpen && <StyleSelector selectedStyle={stylePreset} onSelect={setStylePreset} onClose={() => setIsStyleSelectorOpen(false)} onSuggestStyle={async () => {}} isSuggestingStyle={false} />}
        </Card>
    );
};

const ChevronDown: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
);