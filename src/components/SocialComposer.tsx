import React, { useState, useRef, useEffect } from 'react';
import { toBlob } from 'html-to-image';
import { PromptCard } from './PromptCard';
import { XCircleIcon, InstagramIcon, ShareIcon, CopyIcon, DownloadIcon, SparklesIcon, CheckCircleIcon } from './icons/Icons';
import type { HistoryItem, CaptionResponse } from '../types';
import { generateSocialCaption } from '../services/geminiService';

interface SocialComposerProps {
  item: HistoryItem;
  onClose: () => void;
}

export const SocialComposer: React.FC<SocialComposerProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'caption'>('preview');
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [captionData, setCaptionData] = useState<CaptionResponse | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isRendering, setIsRendering] = useState(true);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Render Prompt Card to Blob on mount
  useEffect(() => {
    const renderCard = async () => {
      if (cardRef.current && item.blueprint) {
        try {
          // Wait for fonts/images
          await new Promise(resolve => setTimeout(resolve, 500));
          const blob = await toBlob(cardRef.current, { width: 1080, height: 1080 });
          setCardBlob(blob);
        } catch (e) {
          console.error("Failed to render prompt card", e);
        } finally {
          setIsRendering(false);
        }
      }
    };
    renderCard();
  }, [item]);

  // Generate Caption
  const handleGenerateCaption = async () => {
    if (captionData) return;
    setIsGeneratingCaption(true);
    try {
        const result = await generateSocialCaption(item.outputImage, item.inputs.prompt);
        setCaptionData(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingCaption(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardBlob) return;
    
    try {
        const imageFile = await (await fetch(item.outputImage)).blob();
        const filesArray = [
            new File([imageFile], 'vhms_result.png', { type: 'image/png' }),
            new File([cardBlob], 'vhms_prompt_card.png', { type: 'image/png' })
        ];

        if (navigator.share && navigator.canShare({ files: filesArray })) {
            await navigator.share({
                files: filesArray,
                title: 'VHMS Studio Creation',
                text: captionData ? `${captionData.caption}\n\n${captionData.hashtags.join(' ')}` : ''
            });
        } else {
            alert("Browser Anda tidak mendukung Web Share API. Mengunduh file sebagai gantinya.");
            // Fallback download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(cardBlob);
            link.download = 'prompt_card.png';
            link.click();
        }
    } catch (e) {
        console.error("Sharing failed", e);
    }
  };

  const handleCopyCaption = () => {
      if (captionData) {
          const text = `${captionData.caption}\n\n${captionData.hashtags.join(' ')}`;
          navigator.clipboard.writeText(text);
          alert("Caption disalin ke clipboard!");
      }
  };

  if (!item.blueprint) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Hidden Render Target */}
        <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
            <PromptCard ref={cardRef} blueprint={item.blueprint} imageSrc={item.outputImage} />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <InstagramIcon className="w-6 h-6 text-pink-500" /> VHMS Social Engine
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Left: Preview */}
            <div className="flex-1 bg-black/50 p-6 flex flex-col items-center justify-center gap-4 overflow-y-auto">
                <div className="flex gap-4 w-full justify-center">
                    {/* Slide 1: Image */}
                    <div className="aspect-[4/5] h-[400px] bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg relative group">
                        <img src={item.outputImage} className="w-full h-full object-cover" alt="Result" />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur font-bold">SLIDE 1</div>
                    </div>
                    {/* Slide 2: Card */}
                    <div className="aspect-[4/5] h-[400px] bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg relative group">
                        {isRendering ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse">Rendering...</div>
                        ) : cardBlob ? (
                            <img src={URL.createObjectURL(cardBlob)} className="w-full h-full object-contain bg-slate-900" alt="Card" />
                        ) : null}
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur font-bold">SLIDE 2</div>
                    </div>
                </div>
                <p className="text-slate-400 text-xs text-center mt-2">
                    Paket konten ini siap diposting sebagai Carousel (Slide 1: Hasil, Slide 2: Prompt).
                </p>
            </div>

            {/* Right: Tools */}
            <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
                <div className="flex border-b border-slate-700">
                    <button onClick={() => setActiveTab('caption')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'caption' ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}>AI Caption</button>
                    <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'preview' ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}>Settings</button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto">
                    {activeTab === 'caption' && (
                        <div className="space-y-4">
                            {!captionData ? (
                                <div className="text-center py-8">
                                    <SparklesIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400 mb-4">Biarkan AI menulis caption menarik dan hashtag yang relevan untuk gambar ini.</p>
                                    <button 
                                        onClick={handleGenerateCaption} 
                                        disabled={isGeneratingCaption}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold w-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isGeneratingCaption ? 'Menulis...' : 'Generate Caption'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{captionData.caption}</p>
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {captionData.hashtags.map(tag => (
                                                <span key={tag} className="text-xs text-blue-400">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleCopyCaption} className="w-full border border-slate-600 hover:border-slate-400 text-slate-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                        <CopyIcon className="w-4 h-4" /> Salin Teks
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-900">
                    <button 
                        onClick={handleNativeShare}
                        disabled={isRendering}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        <ShareIcon className="w-5 h-5" />
                        BAGIKAN SEKARANG
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2">
                        Membuka Instagram/TikTok secara otomatis di HP.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};