import React from 'react';
import type { AppStatus, UnifiedAnalysisData, SceneSource, Resolution, AnalysisModelsState, AnalysisModelSelection } from '../types';
import { Card } from './common/Card';
import { GenerateIcon, DownloadIcon, EditIcon, BlueprintIcon, ReloadIcon, XCircleIcon, SparklesIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { StepProgress } from './common/StepProgress';

interface OutputPanelProps {
  outputImage: string | null;
  appStatus: AppStatus;
  statusMessage: string;
  onStartGeneration: () => void;
  isBusy: boolean;
  error: string | null;
  onStartEditing: () => void;
  unifiedData: UnifiedAnalysisData | null;
  resolution: Resolution;
  analysisModels: AnalysisModelsState;
  onModelChange: (module: keyof AnalysisModelsState, value: AnalysisModelSelection) => void;
  sceneSource: SceneSource;
  generationProgress: number;
  onOpenInspector: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  outputImage, appStatus, statusMessage, onStartGeneration, isBusy, error, onStartEditing, resolution, generationProgress, unifiedData, onOpenInspector
}) => {
  const { t } = useLanguage();
  
  const isProcessing = appStatus !== 'IDLE' && appStatus !== 'DONE' && appStatus !== 'ERROR';
  
  const getButtonText = () => {
    if (appStatus === 'INITIALIZING') return 'Initializing Engine...';
    if (isProcessing) return `Synthesizing ${Math.round(generationProgress)}%`;
    if (error) return 'Retry Generation';
    return t.startGen;
  }

  return (
    <Card 
      title={t.outputTitle} 
      titleIcon={<SparklesIcon className="w-5 h-5 text-amber-500"/>}
      tooltip={t.outputTooltip}
      className="h-full flex flex-col border-slate-800/80 shadow-2xl"
      headerContent={
        unifiedData && (
          <button 
            onClick={onOpenInspector}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-800/80 text-amber-500 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-amber-400 transition-all active:scale-95 shadow-sm"
          >
            <BlueprintIcon className="w-3.5 h-3.5" />
            OMNI-DATA
          </button>
        )
      }
    >
      <div className="flex flex-col h-full gap-6">
        {/* Main Display Area */}
        <div className="flex-grow museum-light rounded-2xl border border-slate-800/80 overflow-hidden relative flex flex-col items-center justify-center min-h-[450px] shadow-inner group">
          
          {/* SCANLINE OVERLAY */}
          {isProcessing && <div className="absolute inset-0 z-30 scanline-active opacity-30 pointer-events-none"></div>}

          {/* STATE 1: PROCESSING / LOADING */}
          {isProcessing && (
            <div className="w-full h-full absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                <div className="w-full max-w-sm">
                    {/* Matrix Status */}
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Latent State</span>
                            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">{appStatus.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-2xl font-black text-white font-mono opacity-80">{generationProgress}%</span>
                    </div>
                    
                    {/* Premium Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2.5 mb-8 p-0.5 border border-slate-800 shadow-inner overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                    </div>
                    
                    {/* Visual Step Tracker */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                        <StepProgress status={appStatus} />
                    </div>
                    
                    {/* Technical Metadata */}
                    <div className="mt-8 text-center">
                        <span className="text-[9px] font-black bg-slate-800/80 text-slate-500 px-4 py-2 rounded-full border border-slate-700 tracking-widest uppercase shadow-sm">
                            VHMS Synthesis Pipeline v13.1
                        </span>
                    </div>
                </div>
            </div>
          )}

          {/* STATE 2: ERROR */}
          {error && !isProcessing && (
            <div className="p-10 text-center max-w-md animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <XCircleIcon className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-red-400 mb-3 uppercase tracking-widest">{t.statusError}</h3>
                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl mb-6 backdrop-blur-sm shadow-inner">
                    <p className="text-xs text-red-300/80 font-mono leading-relaxed break-words">{error}</p>
                </div>
                <button 
                    onClick={onStartGeneration}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto shadow-lg"
                >
                    <ReloadIcon className="w-4 h-4" />
                    Reset & Retry
                </button>
            </div>
          )}

          {/* STATE 3: RESULT */}
          {outputImage && !isProcessing && !error ? (
            <div className="relative w-full h-full group animate-in fade-in zoom-in-105 duration-1000 ease-out">
                <img src={outputImage} alt="Generated output" className="w-full h-full object-contain" />
                
                {/* TOOLBAR OVERLAY */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button onClick={onStartEditing} className="bg-slate-900/90 backdrop-blur-xl text-white hover:bg-amber-500 hover:text-slate-900 p-3.5 rounded-2xl border border-white/10 shadow-2xl transition-all active:scale-90" title={t.editImage}>
                    <EditIcon className="w-6 h-6" />
                  </button>
                  <a href={outputImage} download={`vhms_render_${Date.now()}.png`} className="bg-slate-900/90 backdrop-blur-xl text-white hover:bg-emerald-500 hover:text-slate-900 p-3.5 rounded-2xl border border-white/10 shadow-2xl transition-all active:scale-90" title={t.download}>
                    <DownloadIcon className="w-6 h-6" />
                  </a>
                </div>

                {/* BOTTOM BADGE */}
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{resolution} Synthesis Verified</span>
                    </div>
                </div>
            </div>
          ) : !isProcessing && !error && (
            /* STATE 4: IDLE / EMPTY */
            <div className="text-center p-12 animate-in fade-in duration-700">
                <div className="w-24 h-24 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 bg-slate-900/20 group-hover:border-amber-500/30 transition-colors">
                    <GenerateIcon className="w-10 h-10 text-slate-700 group-hover:text-amber-500/50 group-hover:scale-110 transition-all duration-500" />
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t.result}</h4>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">{t.resultDesc}</p>
            </div>
          )}
        </div>

        {/* MAIN ACTION BUTTON */}
        <div className="px-1">
            <button 
                onClick={onStartGeneration} 
                disabled={isBusy} 
                className={`w-full group relative overflow-hidden font-black text-xs uppercase tracking-[0.3em] py-5 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 ${
                    isBusy 
                    ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed shadow-none' 
                    : error 
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                        : 'bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-900/40'
                }`}
            >
              {/* Shine effect on button */}
              {!isBusy && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>}
              
              {isBusy ? (
                  <div className="w-5 h-5 border-3 border-slate-600 border-t-slate-400 rounded-full animate-spin"></div>
              ) : error ? (
                  <ReloadIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              ) : (
                  <GenerateIcon className="w-5 h-5 group-hover:scale-125 transition-transform" />
              )}
              <span className="relative z-10">{getButtonText()}</span>
            </button>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Card>
  );
};