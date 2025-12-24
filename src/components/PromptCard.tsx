import React, { forwardRef } from 'react';
import type { PromptBlueprint } from '../types';
import { BotIcon } from './icons/Icons';

interface PromptCardProps {
  blueprint: PromptBlueprint;
  imageSrc: string;
}

export const PromptCard = forwardRef<HTMLDivElement, PromptCardProps>(({ blueprint, imageSrc }, ref) => {
  return (
    <div 
      ref={ref} 
      className="w-[1080px] h-[1080px] bg-slate-900 text-slate-200 relative overflow-hidden font-sans flex flex-col"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)' }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img src={imageSrc} className="w-full h-full object-cover blur-3xl scale-110" alt="bg" />
      </div>
      
      {/* Header */}
      <div className="p-12 pb-6 border-b border-slate-700/50 flex justify-between items-center z-10 bg-slate-900/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40">
            <span className="font-bold text-slate-900 text-4xl">V</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">VHMS <span className="text-amber-400">STUDIO</span></h1>
            <p className="text-slate-400 text-lg uppercase tracking-widest font-mono mt-1">Generative AI Blueprint</p>
          </div>
        </div>
        <div className="text-right">
            <div className="text-5xl font-mono font-bold text-slate-500 opacity-20">v8.2</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-12 z-10 flex flex-col gap-8">
        
        {/* Prompt Section */}
        <div className="flex-grow bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
            <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <BotIcon className="w-6 h-6"/> Director's Prompt
            </h2>
            <p className="text-2xl leading-relaxed text-slate-200 font-mono line-clamp-[12]">
                {blueprint.finalPromptText}
            </p>
        </div>

        {/* Tech Specs Footer */}
        <div className="grid grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">Resolution</p>
                <p className="text-2xl font-mono text-white">{blueprint.configuration.resolution}</p>
            </div>
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">Aspect Ratio</p>
                <p className="text-2xl font-mono text-white">{blueprint.configuration.aspectRatio}</p>
            </div>
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">Mode</p>
                <p className="text-xl font-mono text-white truncate">{blueprint.configuration.sceneSource.toUpperCase()}</p>
            </div>
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">Style</p>
                <p className="text-xl font-mono text-amber-400 truncate">{blueprint.configuration.stylePreset || 'N/A'}</p>
            </div>
        </div>

      </div>
    </div>
  );
});

PromptCard.displayName = 'PromptCard';