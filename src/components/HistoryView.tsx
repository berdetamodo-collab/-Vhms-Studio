import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon, ReloadIcon, BlueprintIcon, ShareIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { SocialComposer } from './SocialComposer';

interface HistoryViewProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onInspect: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onRestore, onInspect }) => {
  const { t, language } = useLanguage();
  const [sharingItem, setSharingItem] = useState<HistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 h-full flex flex-col justify-center items-center">
        <HistoryIcon className="w-16 h-16 mx-auto opacity-20" />
        <h2 className="mt-4 text-xl font-semibold text-slate-300">{t.noHistory}</h2>
        <p className="mt-1 text-sm">{t.noHistoryDesc}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-amber-400" />
            {t.historyTitle}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {history.map((item) => (
            <div key={item.id} className="group relative aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shadow-md">
                <img src={item.outputImage} alt="History thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs font-mono text-slate-300 truncate mb-3" title={item.inputs.prompt}>
                        {item.inputs.prompt || (language === 'id' ? "[Prompt Kosong]" : "[Empty Prompt]")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => onRestore(item)} className="flex-1 text-xs font-bold text-amber-900 bg-amber-500 hover:bg-amber-400 transition-colors py-1.5 rounded flex items-center justify-center gap-1 shadow-sm">
                            <ReloadIcon className="w-3 h-3" />
                            {t.restore}
                        </button>
                        {item.blueprint && (
                            <>
                                <button onClick={() => onInspect(item)} className="flex-1 text-xs font-bold text-sky-900 bg-sky-500 hover:bg-sky-400 transition-colors py-1.5 rounded flex items-center justify-center gap-1 shadow-sm" title="Lihat Blueprint">
                                    <BlueprintIcon className="w-3 h-3" />
                                </button>
                                <button onClick={() => setSharingItem(item)} className="flex-1 text-xs font-bold text-pink-900 bg-pink-500 hover:bg-pink-400 transition-colors py-1.5 rounded flex items-center justify-center gap-1 shadow-sm" title="Bagikan ke Sosmed">
                                    <ShareIcon className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        ))}
        </div>
        
        {/* Social Composer Modal */}
        {sharingItem && (
            <SocialComposer item={sharingItem} onClose={() => setSharingItem(null)} />
        )}

        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }`}</style>
    </div>
  );
};