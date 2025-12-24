import React, { useState } from 'react';
import type { FileWithPreview } from '../types';
import { UploadIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface IdentityLockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (files: FileWithPreview[]) => Promise<void>;
    isGeneratingLock: boolean;
}

export const IdentityLockModal: React.FC<IdentityLockModalProps> = ({ isOpen, onClose, onGenerate, isGeneratingLock }) => {
    // FIX: Destructure 'language' from useLanguage()
    const { t, language } = useLanguage();
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles)
                .filter(file => file.type.startsWith('image/'))
                .map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
            setFiles(prev => [...prev, ...newFiles].slice(0, 5));
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files);
    };
    
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };
    
    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));
    
    const handleGenerateClick = (e: React.MouseEvent) => { 
        e.preventDefault();
        e.stopPropagation();
        if (files.length > 0 && !isGeneratingLock) {
            onGenerate(files);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-amber-400">{t.idLockTitle}</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">{t.idLockDesc}</p>

                <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`p-4 border-2 border-dashed rounded-md transition-colors h-48 flex flex-col items-center justify-center ${dragActive ? 'border-amber-500 bg-amber-900/20' : 'border-slate-600'}`}>
                    <UploadIcon className="w-8 h-8 text-slate-500 mb-2"/>
                    {/* FIX: Use 'language' variable instead of 't.language' */}
                    <p className="text-slate-400">{t.uploadPrompt}, {language === 'id' ? 'atau' : 'or'} <label htmlFor="identity-upload" className="font-semibold text-amber-400 cursor-pointer hover:underline">{language === 'id' ? 'klik untuk memilih' : 'click to select'}</label>.</p>
                    <p className="text-xs text-slate-500 mt-1">{t.maxImages}</p>
                    <input type="file" id="identity-upload" multiple accept="image/*" className="hidden" onChange={e => handleFileChange(e.target.files)} />
                </div>

                <div className="grid grid-cols-5 gap-2 mt-4 min-h-[60px]">
                    {files.map((file, i) => (
                        <div key={i} className="relative aspect-square">
                            <img src={file.preview} alt={`preview ${i}`} className="w-full h-full object-cover rounded"/>
                            <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-bold">X</button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="text-slate-300 px-4 py-2 rounded-md hover:bg-slate-700 font-semibold">{t.cancel}</button>
                    <button 
                        type="button" 
                        onClick={handleGenerateClick} 
                        disabled={files.length === 0 || isGeneratingLock} 
                        className="bg-amber-500 text-slate-900 px-6 py-2 rounded-md hover:bg-amber-600 font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isGeneratingLock ? t.processing : `${t.makeLock} (${files.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};