
import React, { useState, useMemo } from 'react';
import type { AnalysisModelsState, AnalysisModelSelection, SceneSource } from '../types';
import { ModelToggleSwitch } from './common/ModelToggleSwitch';
import { Tooltip } from './common/Tooltip';
import { ChevronDown, ChevronRight, InfoCircleIcon, ShieldCheckIcon } from './icons/Icons';

interface ModelConfigurationProps {
    analysisModels: AnalysisModelsState;
    onModelChange: (value: AnalysisModelSelection) => void;
    isDisabled: boolean;
    sceneSource: SceneSource;
}

export const ModelConfiguration: React.FC<ModelConfigurationProps> = ({ analysisModels, onModelChange, isDisabled, sceneSource }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Menentukan nilai global saat ini (jika salah satu 'Pro', anggap 'Pro')
    const globalValue: AnalysisModelSelection = useMemo(() => {
        const values = Object.values(analysisModels);
        return values.includes('Pro') ? 'Pro' : 'Fast';
    }, [analysisModels]);

    const moduleList = useMemo(() => {
        if (sceneSource === 'generate') return ['Identity DNA (NISF)'];
        if (sceneSource === 'reference') return ['Subject Biometrics', 'Scene Texture', 'Noise Spectrum'];
        return [
            'Subject Analysis', 'Scene Deconstruction', 'Perspective Mapping', 
            'Photometric Matching', 'Depth Interpolation', 'Noise Profile',
            'Pose Interaction', 'Contact Shadows', 'VFX Synthesis'
        ];
    }, [sceneSource]);

    return (
        <div className={`bg-slate-900/50 p-3 rounded-lg border border-slate-700 transition-all ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col gap-3">
                {/* MASTER SWITCH HEADER */}
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded-md border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Global Precision Level</span>
                    </div>
                    <div className="w-32">
                        <ModelToggleSwitch 
                            value={globalValue} 
                            onChange={onModelChange} 
                            disabled={isDisabled} 
                        />
                    </div>
                </div>

                {/* MODULES LIST TOGGLE */}
                <button onClick={() => setIsOpen(!isOpen)} disabled={isDisabled} className="flex justify-between items-center w-full focus:outline-none px-1 text-slate-500 hover:text-slate-300 transition-colors">
                    <div className="flex items-center gap-2">
                        <InfoCircleIcon className="w-3 h-3 opacity-40"/>
                        <span className="text-[9px] font-bold uppercase tracking-tight">Active Analysis Modules ({moduleList.length})</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {isOpen && (
                    <div className="pt-2 px-1 animate-fade-in">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-800 pt-2">
                            {moduleList.map(mod => (
                                <div key={mod} className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${globalValue === 'Pro' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}></div>
                                    <span className="text-[10px] text-slate-400 font-mono truncate">{mod}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[8px] text-slate-500 mt-3 italic">*Switching to PRO increases latent complexity and improves physical accuracy but may increase response time.</p>
                    </div>
                )}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }`}</style>
        </div>
    );
};
