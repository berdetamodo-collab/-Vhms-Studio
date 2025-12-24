import React, { useState } from 'react';
import { Card } from './common/Card';
import { PromptIcon, CopyIcon, CheckCircleIcon, BlueprintIcon, LayersIcon, DownloadIcon } from './icons/Icons';
import type { PromptBlueprint } from '../types';

interface PromptBlueprintViewerProps {
  blueprint: PromptBlueprint | null;
}

type ActiveTab = 'prompt' | 'analysis' | 'config';

export const FinalPromptDisplay: React.FC<PromptBlueprintViewerProps> = ({ blueprint }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('prompt');

  const handleCopy = () => {
    if (!blueprint?.finalPromptText) return;
    navigator.clipboard.writeText(blueprint.finalPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    if (!blueprint) return;
    const jsonString = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vhms_blueprint_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!blueprint) return null;

  const TabButton: React.FC<{ tabId: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors ${
        activeTab === tabId ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Card
      title="PROMPT BLUEPRINT"
      titleIcon={<BlueprintIcon className="w-4 h-4" />}
      tooltip="Ini adalah 'cetak biru' lengkap dari generasi gambar Anda, termasuk data analisis AI dan konfigurasi."
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between bg-slate-900 p-1 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1">
                <TabButton tabId="prompt" label="Final Prompt" icon={<PromptIcon className="w-4 h-4" />} />
                <TabButton tabId="analysis" label="Data Analisis" icon={<BlueprintIcon className="w-4 h-4" />} />
                <TabButton tabId="config" label="Konfigurasi" icon={<LayersIcon className="w-4 h-4" />} />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-lg bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white hover:border-slate-500"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              UNDUH BLUEPRINT
            </button>
        </div>

        <div className="relative group">
          {activeTab === 'prompt' && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap break-words leading-relaxed max-h-[300px] overflow-y-auto selection:bg-amber-500/30 shadow-inner">
              {blueprint.finalPromptText}
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-lg ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                }`}
              >
                {copied ? <><CheckCircleIcon className="w-3.5 h-3.5" />COPIED!</> : <><CopyIcon className="w-3.5 h-3.5" />COPY PROMPT</>}
              </button>
            </div>
          )}

          {activeTab === 'analysis' && (
             <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-words leading-relaxed max-h-[300px] overflow-y-auto selection:bg-amber-500/30 shadow-inner">
                <code>{blueprint.analysisData ? JSON.stringify(blueprint.analysisData, null, 2) : "Data analisis tidak tersedia."}</code>
             </pre>
          )}

          {activeTab === 'config' && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 max-h-[300px] overflow-y-auto shadow-inner grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><strong className="block text-slate-500 uppercase text-[9px]">Mode</strong>{blueprint.configuration.sceneSource}</div>
              <div><strong className="block text-slate-500 uppercase text-[9px]">Resolusi</strong>{blueprint.configuration.resolution}</div>
              <div><strong className="block text-slate-500 uppercase text-[9px]">Rasio Aspek</strong>{blueprint.configuration.aspectRatio}</div>
              {blueprint.configuration.stylePreset && <div><strong className="block text-slate-500 uppercase text-[9px]">Gaya</strong>{blueprint.configuration.stylePreset}</div>}
              {blueprint.configuration.realismIntensity !== undefined && <div><strong className="block text-slate-500 uppercase text-[9px]">Realisme</strong>{Math.round(blueprint.configuration.realismIntensity * 100)}%</div>}
              {blueprint.inputMetadata.subjectImageName && <div><strong className="block text-slate-500 uppercase text-[9px]">File Subjek</strong>{blueprint.inputMetadata.subjectImageName}</div>}
              {blueprint.inputMetadata.sceneImageName && <div><strong className="block text-slate-500 uppercase text-[9px]">File Latar</strong>{blueprint.inputMetadata.sceneImageName}</div>}
              {blueprint.inputMetadata.referenceImageName && <div><strong className="block text-slate-500 uppercase text-[9px]">File Referensi</strong>{blueprint.inputMetadata.referenceImageName}</div>}
              {blueprint.inputMetadata.outfitImageName && <div><strong className="block text-slate-500 uppercase text-[9px]">File Pakaian</strong>{blueprint.inputMetadata.outfitImageName}</div>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};