import React from 'react';
import type { UnifiedAnalysisData } from '../types';
import { FaceIdIcon } from './icons/Icons';

interface FacialAnalysisOverlayProps {
  data: UnifiedAnalysisData | null;
  isVisible: boolean;
}

export const FacialAnalysisOverlay: React.FC<FacialAnalysisOverlayProps> = ({ data, isVisible }) => {
  if (!isVisible || !data) return null;

  const { facsAnalysis, gazeAnalysis } = data;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 animate-hud-scan" style={{borderRadius: '50%'}}>
      <div className="absolute inset-0 border-[1px] border-amber-500/30" style={{borderRadius: '50%'}}></div>
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400" style={{borderRadius: '50% 0 0 0'}}></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400" style={{borderRadius: '0 50% 0 0'}}></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400" style={{borderRadius: '0 0 0 50%'}}></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400" style={{borderRadius: '0 0 50% 0'}}></div>

      {gazeAnalysis && (
          <div className="absolute top-1/4 left-full ml-2 flex flex-col items-start gap-1">
             <div className="bg-black/70 p-1.5 rounded border-l-2 border-green-500/50 max-w-[100px]">
                <p className="text-[7px] font-mono text-green-400 uppercase mb-0.5">GAZE</p>
                <p className="text-[8px] text-white font-semibold leading-tight">{gazeAnalysis.direction}</p>
             </div>
          </div>
      )}

      {facsAnalysis && (
          <div className="absolute bottom-1/4 left-full ml-2">
             <div className="bg-black/70 p-1.5 rounded border-l-2 border-amber-500/50 max-w-[100px]">
                <p className="text-[7px] font-mono text-amber-500 uppercase mb-0.5">EXPRESSION</p>
                <p className="text-[8px] text-slate-200 leading-snug line-clamp-2">{facsAnalysis.musculatureDescription}</p>
             </div>
          </div>
      )}

      <style>{`
        @keyframes hudScan {
          0%, 100% { box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.1); }
          50% { box-shadow: inset 0 0 30px rgba(245, 158, 11, 0.2); }
        }
        .animate-hud-scan { animation: hudScan 4s infinite; }
      `}</style>
    </div>
  );
};
