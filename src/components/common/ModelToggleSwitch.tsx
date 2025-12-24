import React from 'react';
import type { AnalysisModelSelection } from '../../types';

interface ModelToggleSwitchProps {
    value: AnalysisModelSelection;
    onChange: (value: AnalysisModelSelection) => void;
    disabled: boolean;
}

export const ModelToggleSwitch: React.FC<ModelToggleSwitchProps> = ({ value, onChange, disabled }) => {
    return (
        <div className="flex bg-slate-950 p-0.5 rounded-md border border-slate-700 h-7 w-full shadow-inner relative select-none">
            {(['Fast', 'Pro'] as AnalysisModelSelection[]).map(option => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    disabled={disabled}
                    className={`flex-1 h-full text-[10px] uppercase tracking-wider rounded transition-all duration-200 flex items-center justify-center font-bold ${
                        value === option 
                            ? 'bg-amber-600 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};
