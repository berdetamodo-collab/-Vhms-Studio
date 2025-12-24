
import React from 'react';
import type { UnifiedAnalysisData } from '../types';
import { XCircleIcon, CameraIcon, SunIcon, PaletteIcon, BlueprintIcon, InfoCircleIcon, FaceIdIcon, CubeIcon, SparklesIcon, CrosshairIcon, BrushIcon, UserIcon } from './icons/Icons';

interface PromptInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnifiedAnalysisData | null;
}

const DataField: React.FC<{ label: string; value?: string | number | boolean | null; children?: React.ReactNode }> = ({ label, value, children }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="mb-2">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      {children ? children : <p className="text-sm text-slate-200">{String(value)}</p>}
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 h-full">
        <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
            {icon}
            {title}
        </h4>
        {children}
    </div>
);

export const PromptInspector: React.FC<PromptInspectorProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in-fast backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-3 bg-slate-900/70 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <InfoCircleIcon className="w-4 h-4 text-amber-500" />
            OMNI-ANALYSIS INSPECTOR v12.29
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               
                {/* [NEW v12.29] HAIR & STRAND DYNAMICS SECTION */}
                <Section title="HAIR DYNAMICS (NHSD)" icon={<SparklesIcon className="w-4 h-4 text-purple-400"/>}>
                    <DataField label="Detected Texture" value={data.hairDynamics?.texture.toUpperCase()} />
                    <DataField label="Strand Definition" value={data.hairDynamics?.strandDefinition.toUpperCase()} />
                    <DataField label="Atmospheric Interaction">
                        <div className="flex items-center gap-3 mt-1">
                            <div className="p-2 bg-slate-800 rounded border border-slate-700 flex flex-col items-center">
                                <span className="text-[8px] text-slate-500 mb-1">WIND VECTOR</span>
                                <div className="w-8 h-8 relative flex items-center justify-center">
                                     <div className="w-0.5 h-6 bg-purple-500/50 absolute"></div>
                                     <div 
                                        className="w-4 h-4 text-purple-400 transition-transform duration-700"
                                        style={{ transform: `rotate(${data.hairDynamics?.atmosphericDisplacement.windDirection === 'left' ? -90 : data.hairDynamics?.atmosphericDisplacement.windDirection === 'right' ? 90 : 0}deg)` }}
                                     >↑</div>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] text-slate-300">Intensitas: {Math.round((data.hairDynamics?.atmosphericDisplacement.intensity || 0) * 100)}%</p>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                                    <div className="bg-purple-500 h-full" style={{ width: `${(data.hairDynamics?.atmosphericDisplacement.intensity || 0) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </DataField>
                    <DataField label="Specular Directives" value={data.hairDynamics?.specularDirectives} />
                </Section>

                <Section title="FABRIC & DRAPERY (ACPD)" icon={<BrushIcon className="w-4 h-4 text-pink-400"/>}>
                    <DataField label="Detected Fabric" value={data.clothPhysics?.detectedFabricType} />
                    <DataField label="Drapery Logic" value={data.clothPhysics?.draperyLogic} />
                </Section>

                <Section title="POSE SYNC (ANCHORS)" icon={<CrosshairIcon className="w-4 h-4 text-green-400"/>}>
                    <DataField label="Interaction Opportunity" value={data.interaction?.hasInteractionOpportunity ? "YES" : "NONE"} />
                    <DataField label="Optimal Pose" value={data.interaction?.optimalInteractionPose} />
                </Section>

                <Section title="RELIGHTING MAP (AAR)" icon={<SunIcon className="w-4 h-4 text-yellow-400"/>}>
                    <DataField label="Source Type" value={data.photometric?.relighting?.primaryLightSource.type.toUpperCase()} />
                    <div className="mt-2 p-2 bg-black rounded border border-slate-700 relative aspect-video flex items-center justify-center overflow-hidden">
                        <span className="text-[8px] text-slate-600 font-bold uppercase">Spatial Map</span>
                        {data.photometric?.relighting && (
                            <SunIcon className="absolute w-4 h-4 text-yellow-400" style={{ 
                                left: `${(data.photometric.relighting.primaryLightSource.normalizedPosition.x || 0.5) * 100}%`, 
                                top: `${(data.photometric.relighting.primaryLightSource.normalizedPosition.y || 0.5) * 100}%`,
                                transform: 'translate(-50%, -50%)'
                            }} />
                        )}
                    </div>
                </Section>

                <Section title="DEPTH & PERSPECTIVE" icon={<BlueprintIcon className="w-4 h-4 text-sky-400"/>}>
                    <DataField label="Horizon Position" value={`${((data.perspective?.horizonLineY || 0) * 100).toFixed(0)}%`} />
                </Section>

                <Section title="BIOMETRIC & SKIN (STMS)" icon={<FaceIdIcon className="w-4 h-4 text-amber-400"/>}>
                    <DataField label="Undertone" value={data.skinToneAnalysis?.chromaticProfile?.undertone?.toUpperCase()} />
                </Section>
            </div>
        </div>

        <div className="px-4 py-3 bg-slate-900/70 border-t border-slate-700 text-right">
          <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-6 py-2 rounded transition-colors shadow-lg">
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } } 
        .animate-fade-in-fast { animation: fadeInFast 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};
