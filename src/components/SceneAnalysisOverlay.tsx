import React from 'react';
import type { UnifiedAnalysisData, SceneSource } from '../types';
import { SunIcon, BlueprintIcon, PaletteIcon, CameraIcon, CubeIcon } from './icons/Icons';

interface SceneAnalysisOverlayProps {
  data: UnifiedAnalysisData | null;
  isVisible: boolean;
  mode: SceneSource;
}

export const SceneAnalysisOverlay: React.FC<SceneAnalysisOverlayProps> = ({ data, isVisible, mode }) => {
  if (!isVisible || !data) return null;

  if (mode === 'reference') {
      if (!data.referenceAnalysis) return null;
      return (
        <div className="absolute inset-0 pointer-events-none z-10 animate-hud-scan-blue" style={{borderRadius: '50%'}}>
          <div className="absolute inset-0 border-[1px] border-purple-500/30" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400" style={{borderRadius: '50% 0 0 0'}}></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400" style={{borderRadius: '0 0 50% 0'}}></div>
          <div className="absolute top-1/4 right-full mr-2 flex flex-col items-end gap-1 text-right">
             <div className="bg-black/70 p-1.5 rounded border-r-2 border-purple-500/50 max-w-[100px]">
                <p className="text-[7px] font-mono text-purple-400 uppercase mb-0.5">STYLE</p>
                <p className="text-[8px] text-white font-semibold leading-tight line-clamp-2">{data.referenceAnalysis.artisticStyle}</p>
             </div>
          </div>
           <style>{`@keyframes hudScanBlue { 0%, 100% { box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.1); } 50% { box-shadow: inset 0 0 30px rgba(168, 85, 247, 0.2); } } .animate-hud-scan-blue { animation: hudScanBlue 4s infinite; }`}</style>
        </div>
      );
  }

  // UPLOAD MODE
  return (
    <div className="absolute inset-0 pointer-events-none z-10 animate-hud-scan-cyan" style={{borderRadius: '50%'}}>
      <div className="absolute inset-0 border-[1px] border-cyan-500/30" style={{borderRadius: '50%'}}></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" style={{borderRadius: '0 50% 0 0'}}></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" style={{borderRadius: '0 0 0 50%'}}></div>
      {data.photometric && (
          <div className="absolute top-1/4 right-full mr-2 flex flex-col items-end gap-1 text-right">
             <div className="bg-black/70 p-1.5 rounded border-r-2 border-yellow-500/50 max-w-[100px]">
                <p className="text-[7px] font-mono text-yellow-400 uppercase mb-0.5">LIGHTING</p>
                <p className="text-[8px] text-white font-semibold leading-tight">{data.photometric.keyLight.direction}</p>
                <p className="text-[7px] text-slate-400 mt-0.5">{data.photometric.keyLight.colorTemperature}</p>
             </div>
          </div>
      )}
       {data.noiseAnalysis && (
       <div className="absolute bottom-1/4 right-full mr-2 flex flex-col items-end gap-1 text-right">
          <div className="bg-black/70 p-1.5 rounded border-r-2 border-slate-500/50 max-w-[100px]">
              <p className="text-[7px] font-mono text-slate-400 uppercase mb-0.5">SENSOR</p>
              <p className="text-[8px] text-amber-500 font-bold">{data.noiseAnalysis.grainType.toUpperCase()}</p>
          </div>
       </div>
       )}
      <style>{`@keyframes hudScanCyan { 0%, 100% { box-shadow: inset 0 0 10px rgba(6, 182, 212, 0.1); } 50% { box-shadow: inset 0 0 30px rgba(6, 182, 212, 0.2); } } .animate-hud-scan-cyan { animation: hudScanCyan 4s infinite; }`}</style>
    </div>
  );
};
