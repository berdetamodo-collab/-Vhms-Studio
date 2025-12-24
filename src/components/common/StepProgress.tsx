
import React, { useMemo } from 'react';
import type { AppStatus } from '../../types';
import { SearchIcon, BlueprintIcon, SparklesIcon, MagicWandIcon, CheckCircleIcon } from '../icons/Icons';

interface StepProgressProps {
    status: AppStatus;
}

const STEPS = [
    {
        id: 'analysis',
        label: 'Cognitive Scan',
        subLabel: 'Menganalisis Subjek & Scene...',
        icon: SearchIcon,
        match: ['INITIALIZING', 'ANALYZING_PRIMARY', 'STARTING', 'EXTRACTING_STYLE_CACHE_MISS', 'EXTRACTING_STYLE_CACHE_HIT']
    },
    {
        id: 'masking',
        label: 'Subject Removal',
        subLabel: 'Menghapus subjek lama...',
        icon: MagicWandIcon,
        match: ['GENERATING_MASK', 'REMOVING_SUBJECT']
    },
    {
        id: 'logic',
        label: 'Directive Logic',
        subLabel: 'Menyusun Strategi Visual...',
        icon: BlueprintIcon,
        match: ['BUILDING_PROMPT', 'AWAITING_PLACEMENT', 'COMPOSITING_NEW_SUBJECT', 'MERGING_STYLES']
    },
    {
        id: 'generation',
        label: 'Final Blending',
        subLabel: 'Memblending subjek baru...',
        icon: SparklesIcon,
        match: ['GENERATING_IMAGE', 'GENERATING', 'FINAL_BLENDING']
    },
    {
        id: 'polish',
        label: 'Harmonization',
        subLabel: 'Penyelarasan Cahaya & Grain...',
        icon: MagicWandIcon,
        match: ['HARMONIZING', 'EVALUATING']
    }
];

export const StepProgress: React.FC<StepProgressProps> = ({ status }) => {
    
    const currentStepIndex = useMemo(() => {
        if (status === 'DONE') return STEPS.length;
        if (status === 'ERROR') return -1;
        // Cari index langkah terakhir yang cocok dengan status saat ini
        // Namun karena alurnya linear, kita bisa mencari match langsung
        const idx = STEPS.findIndex(step => step.match.includes(status));
        return idx === -1 ? 0 : idx;
    }, [status]);

    return (
        <div className="w-full max-w-sm mx-auto space-y-3 py-4">
            {STEPS.map((step, index) => {
                const isCompleted = status === 'DONE' || index < currentStepIndex;
                const isActive = index === currentStepIndex && status !== 'DONE' && status !== 'ERROR';
                const isPending = index > currentStepIndex && status !== 'DONE';

                return (
                    <div 
                        key={step.id} 
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-slate-800/80 border border-slate-700 shadow-lg translate-x-2' : 'opacity-60 grayscale'}`}
                    >
                        {/* Icon Box */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-300 shrink-0 ${
                            isCompleted ? 'bg-green-500/20 border-green-500 text-green-400' :
                            isActive ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse' :
                            'bg-slate-800 border-slate-700 text-slate-600'
                        }`}>
                            {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                        </div>

                        {/* Text */}
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-center">
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-600'}`}>
                                    {step.label}
                                </h4>
                                {isActive && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                )}
                            </div>
                            <p className={`text-[10px] truncate ${isActive ? 'text-amber-400/80' : 'text-slate-600'}`}>
                                {isActive ? step.subLabel : (isCompleted ? 'Selesai' : 'Menunggu...')}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
