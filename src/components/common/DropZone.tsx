import React, { useCallback, useState, useRef } from 'react';
import type { FileWithPreview } from '../../types';
import { UploadIcon, LinkIcon, GlobeIcon, CheckCircleIcon } from '../icons/Icons';
import { processUniversalLink } from '../../services/linkScraperService';
import { useLanguage } from '../../contexts/LanguageContext';

interface DropZoneProps {
  file: FileWithPreview | null;
  onDrop: (file: FileWithPreview) => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  urlInputPosition?: 'left' | 'center' | 'right';
}

type InputMode = 'file' | 'url';

export const DropZone: React.FC<DropZoneProps> = ({ file, onDrop, title, urlInputPosition = 'center', children }) => {
  // FIX: Destructure 'language' from useLanguage() to access the language code string (e.g. 'en', 'id').
  const { t, language } = useLanguage();
  const [isDragActive, setIsDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (selectedFile?.type.startsWith('image/')) {
      const fileWithPreview = Object.assign(selectedFile, { preview: URL.createObjectURL(selectedFile) });
      onDrop(fileWithPreview); setInputMode('file'); setUrlInput(''); setUrlError(null);
    }
  }, [onDrop]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  const onCircleClick = () => inputRef.current?.click();
  
  const handleUrlSubmit = async () => {
      if (!urlInput.trim()) return; 
      setIsLoadingUrl(true); setUrlError(null);
      try {
          const blob = await processUniversalLink(urlInput);
          if (!blob.type.startsWith('image/')) throw new Error(t.errUrlInvalid);
          handleFile(new File([blob], "scraped_image.jpg", { type: blob.type }));
      } catch (err) { 
          setUrlError(err instanceof Error ? err.message : t.errUrl);
      } finally { 
          setIsLoadingUrl(false); 
      }
  };

  const UrlInputOverlay = () => (
    <div className={`absolute z-20 top-1/2 -translate-y-1/2 ${{'left': 'left-1/2', 'center': 'left-1/2 -translate-x-1/2', 'right': 'right-1/2'}[urlInputPosition]} w-52`} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col p-2.5 bg-slate-800 rounded-lg border border-slate-600 shadow-2xl space-y-2" style={{animation: 'fadeIn 0.2s ease-out forwards'}}>
            <h4 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} placeholder={t.urlPlaceholder} autoFocus className="w-full bg-slate-950 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:border-amber-500 outline-none box-border" />
            <div className="flex w-full gap-2">
                <button onClick={() => { setInputMode('file'); setUrlError(null); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-2 rounded transition-colors">{t.cancel}</button>
                <button onClick={handleUrlSubmit} disabled={isLoadingUrl} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1.5">{isLoadingUrl ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <GlobeIcon className="w-4 h-4"/>}<span>{t.import.toUpperCase()}</span></button>
            </div>
            {urlError && <p className="text-xs text-red-400 pt-1 text-center leading-tight">{urlError}</p>}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(-50%); } to { opacity: 1; transform: scale(1) translateY(-50%); } }`}</style>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start gap-1.5 h-full w-full group py-1 relative" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      {inputMode === 'url' && !file && <UrlInputOverlay />}
      <input ref={inputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/heic, image/*" onChange={handleChange} />
      <div className="text-center h-5 flex flex-col justify-end"><h4 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</h4>{file && <p className="text-[8px] text-green-400 font-mono leading-none mt-0.5 flex items-center justify-center gap-0.5"><CheckCircleIcon className="w-2 h-2"/>Ready</p>}</div>
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${isDragActive ? 'border-2 border-amber-500 bg-amber-900/20 scale-105' : 'border border-slate-600 bg-slate-800/80 hover:border-slate-400 hover:bg-slate-800'} ${file ? 'overflow-hidden border-0' : 'cursor-pointer'}`} onClick={onCircleClick}>
        {file ? (<><img src={file.preview} alt="preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><UploadIcon className="w-5 h-5 text-white" /></div></>) : (<><UploadIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 group-hover:text-amber-500 transition-colors duration-300" /><p className="hidden sm:block text-[8px] text-slate-500 mt-1 font-medium">UPLOAD</p></>)}
        {children && (<div className="absolute -top-1 -right-1 z-20 scale-90 sm:scale-100">{children}</div>)}
      </div>
      <div className="h-6 flex items-start justify-center pt-1 w-full z-10">{!file ? <button onClick={(e) => { e.stopPropagation(); setInputMode('url'); }} className="text-[9px] font-semibold text-slate-500 hover:text-amber-400 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700"><LinkIcon className="w-3 h-3" /><span>{t.linkUrl}</span></button> : <button onClick={onCircleClick} className="text-[9px] text-slate-600 hover:text-slate-400 underline decoration-slate-700 h-6 pt-1">{t.replace}</button>}</div>
    </div>
  );
};