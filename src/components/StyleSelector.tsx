import React, { useState, useMemo } from 'react';
import { STYLE_PRESETS, STYLE_CATEGORIES } from '../data/stylePresets';
import type { StylePreset } from '../types';
import { SearchIcon, MoonIcon, CheckCircleIcon, XCircleIcon, PaletteIcon, ChevronDown, MagicWandIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface StyleSelectorProps {
    selectedStyle: StylePreset;
    onSelect: (style: StylePreset) => void;
    onClose: () => void;
    onSuggestStyle: () => Promise<void>;
    isSuggestingStyle: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, onClose, onSuggestStyle, isSuggestingStyle }) => {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isNightMode, setIsNightMode] = useState(false);

    const localizedCategories = useMemo(() => {
        return STYLE_CATEGORIES.map(cat => ({
            ...cat,
            label: cat.id === 'all' ? t.catAll : cat.label 
        }));
    }, [t.catAll]);
    
    const handleSuggest = async () => {
        await onSuggestStyle();
        // Setelah saran diterapkan di App.tsx, kita tutup panelnya.
        onClose();
    };

    const filteredPresets = useMemo(() => {
        return STYLE_PRESETS.filter(preset => 
            (activeCategory === 'all' || preset.category === activeCategory) &&
            (searchQuery ? preset.label.toLowerCase().includes(searchQuery.toLowerCase()) || preset.description.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
            (isNightMode ? (preset.timeOfDay === 'night' || !preset.timeOfDay) : true)
        );
    }, [activeCategory, searchQuery, isNightMode]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col" style={{animation: 'fadeInFast 0.2s ease-out forwards'}}>
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-lg z-10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><PaletteIcon className="w-5 h-5 text-amber-400" /><h2 className="text-sm font-bold text-white tracking-wide">{t.styleGallery}</h2></div>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><XCircleIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder={t.searchStyle} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="relative min-w-[120px] sm:min-w-[160px]">
                            <select 
                                value={activeCategory} 
                                onChange={(e) => setActiveCategory(e.target.value)}
                                className="w-full h-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-lg pr-8 focus:border-amber-500 focus:outline-none uppercase tracking-wide cursor-pointer hover:bg-slate-700 transition-colors"
                            >
                                {localizedCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                        
                        <button 
                            onClick={handleSuggest} 
                            disabled={isSuggestingStyle}
                            className={`px-3 rounded-lg transition-all border flex items-center justify-center gap-2 text-xs font-bold min-w-[150px] ${isSuggestingStyle ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-wait' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`} 
                            title="Sarankan gaya secara otomatis"
                        >
                          {isSuggestingStyle ? (
                            <>
                                <div className="w-4 h-4 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin"></div>
                                <span>Menganalisis...</span>
                            </>
                          ) : (
                            <>
                                <MagicWandIcon className="w-4 h-4 text-amber-400"/>
                                <span>Saran Otomatis</span>
                            </>
                          )}
                        </button>

                        <button onClick={() => setIsNightMode(!isNightMode)} className={`px-3 rounded-lg transition-all border flex items-center justify-center ${isNightMode ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`} title="Filter Night Mode"><MoonIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-900/50 border-b border-slate-800 py-2 shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-4">
                    {localizedCategories.map(cat => (<button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}>{cat.label}</button>))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 bg-slate-950 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">
                    {filteredPresets.map(preset => {
                        const isSelected = selectedStyle === preset.id;
                        return (<button key={preset.id} onClick={() => { onSelect(preset.id); onClose(); }} className={`relative flex flex-col text-left p-3 rounded-xl border-2 transition-all duration-200 h-full group ${isSelected ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 active:scale-95'}`}>
                                <div className="flex justify-between items-start mb-2 opacity-80"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700 px-2 py-0.5 rounded bg-slate-950 truncate max-w-[70%]">{preset.category}</span>{preset.timeOfDay === 'night' && <MoonIcon className="w-3.5 h-3.5 text-indigo-400" />}</div>
                                <h3 className={`text-sm font-bold mb-1 leading-tight ${isSelected ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'}`}>{preset.label}</h3>
                                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 group-hover:text-slate-400">{preset.description}</p>
                                {isSelected && <div className="absolute top-2 right-2 bg-slate-900 rounded-full shadow-sm"><CheckCircleIcon className="w-5 h-5 text-amber-500" /></div>}
                            </button>);
                    })}
                </div>
                {filteredPresets.length === 0 && (<div className="h-full flex flex-col items-center justify-center text-slate-500 pb-20"><SearchIcon className="w-12 h-12 mb-4 opacity-20" /><p className="text-sm">{t.noStyleFound}</p></div>)}
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; } .no-scrollbar::-webkit-scrollbar { display: none; } @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};