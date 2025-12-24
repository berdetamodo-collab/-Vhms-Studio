import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushIcon, TrashIcon, EraserIcon, GenerateIcon } from './icons/Icons';
// FIX: Changed performInpainting to performInpaintingBlend which is the correctly exported member from geminiService.
import { performInpaintingBlend } from '../services/geminiService';
import type { ApiStatus, Resolution } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

type Tool = 'brush' | 'eraser';
interface Transform { scale: number; offsetX: number; offsetY: number; }
interface InpaintEditorProps { 
    isOpen: boolean; 
    onClose: () => void; 
    imageSrc: string; 
    onApply: (newImageDataUrl: string) => void; 
    setApiStatus: (status: ApiStatus) => void; 
    styleContext?: string; 
    resolution: Resolution; 
}

const HISTORY_LIMIT = 30;

export const InpaintEditor: React.FC<InpaintEditorProps> = ({ isOpen, onClose, imageSrc, onApply, setApiStatus, styleContext, resolution }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null), displayCanvasRef = useRef<HTMLCanvasElement>(null), maskCanvasRef = useRef<HTMLCanvasElement>(null), imageRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>('brush'), [brushSize, setBrushSize] = useState(40), [feather, setFeather] = useState(25), [transform, setTransform] = useState<Transform>({ scale: 1, offsetX: 0, offsetY: 0 }), [cursorStyle, setCursorStyle] = useState('crosshair'), [inpaintPrompt, setInpaintPrompt] = useState<string>(''), [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]), [historyIndex, setHistoryIndex] = useState(-1);
  const isDrawingRef = useRef(false), isPanningRef = useRef(false), lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const redrawDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current, maskCanvas = maskCanvasRef.current, image = imageRef.current;
    if (!displayCanvas || !maskCanvas || !image) return;
    const ctx = displayCanvas.getContext('2d'); if (!ctx) return;
    ctx.save(); ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.translate(transform.offsetX, transform.offsetY); ctx.scale(transform.scale, transform.scale);
    ctx.drawImage(image, 0, 0);
    ctx.globalAlpha = 0.5; ctx.globalCompositeOperation = 'source-atop'; ctx.drawImage(maskCanvas, 0, 0); ctx.fillStyle = '#f59e0b'; ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    ctx.restore();
  }, [transform]);

  useEffect(() => {
    const size = brushSize * transform.scale;
    const cursorSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="none" stroke="${tool === 'brush' ? '#f59e0b' : 'red'}" stroke-width="2"/></svg>`;
    setCursorStyle(`url('data:image/svg+xml;base64,${btoa(cursorSvg)}') ${size/2} ${size/2}, crosshair`);
  }, [tool, brushSize, transform.scale]);

  const pushHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current, maskCtx = maskCanvas?.getContext('2d', { willReadFrequently: true }); if (!maskCanvas || !maskCtx) return;
    setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
        if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
    });
  }, [historyIndex]);

  const applyHistoryState = useCallback((index: number) => {
    const maskCanvas = maskCanvasRef.current, maskCtx = maskCanvas?.getContext('2d', { willReadFrequently: true });
    if (!maskCanvas || !maskCtx || !history[index]) return;
    maskCtx.putImageData(history[index], 0, 0); redrawDisplay();
  }, [history, redrawDisplay]);
  
  const handleUndo = useCallback(() => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); applyHistoryState(newIndex); } }, [historyIndex, applyHistoryState]);
  const handleRedo = useCallback(() => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); applyHistoryState(newIndex); } }, [historyIndex, history.length, applyHistoryState]);

  useEffect(() => {
    if (!isOpen) { imageRef.current = null; return; }
    const displayCanvas = displayCanvasRef.current, maskCanvas = maskCanvasRef.current, container = containerRef.current;
    if (!imageSrc || !displayCanvas || !maskCanvas || !container) return;
    const img = new Image(); img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      displayCanvas.width = img.naturalWidth; displayCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth; maskCanvas.height = img.naturalHeight;
      const scale = Math.min(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight, 1);
      setTransform({ scale, offsetX: (container.clientWidth - img.naturalWidth * scale) / 2, offsetY: (container.clientHeight - img.naturalHeight * scale) / 2 });
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        setHistory([maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)]);
        setHistoryIndex(0);
      }
    };
  }, [isOpen, imageSrc]);

  useEffect(() => { if (isOpen && imageRef.current) redrawDisplay(); }, [transform, redrawDisplay, isOpen]);
  
  const getCanvasCoords = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = displayCanvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left - transform.offsetX) / transform.scale, y: (e.clientY - rect.top - transform.offsetY) / transform.scale };
  }, [transform]);

  const drawOnMask = useCallback((startPos: { x: number; y: number }, endPos: { x: number; y: number }) => {
    const maskCtx = maskCanvasRef.current?.getContext('2d', { willReadFrequently: true }); if (!maskCtx) return;
    maskCtx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    const dist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y), angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x), step = Math.max(1, brushSize / 8);
    for (let i = 0; i < dist; i += step) {
      const x = startPos.x + (Math.cos(angle) * i), y = startPos.y + (Math.sin(angle) * i);
      const gradient = maskCtx.createRadialGradient(x, y, 0, x, y, brushSize / 2);
      const featherStop = Math.max(0.01, 1 - feather / 100);
      gradient.addColorStop(featherStop, 'white'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      maskCtx.fillStyle = gradient; maskCtx.beginPath(); maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2); maskCtx.fill();
    }
  }, [tool, brushSize, feather]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.pointerType === 'mouse' && (e.button === 1 || e.altKey || e.metaKey || e.ctrlKey)) isPanningRef.current = true; else isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPosRef.current = coords;
    drawOnMask(coords, coords); redrawDisplay();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isPanningRef.current) { setTransform(t => ({ ...t, offsetX: t.offsetX + e.movementX, offsetY: t.offsetY + e.movementY })); }
    else if (isDrawingRef.current) { const start = lastPosRef.current, end = getCanvasCoords(e); drawOnMask(start, end); redrawDisplay(); lastPosRef.current = end; }
  };

  const handlePointerUp = () => { if (isDrawingRef.current) pushHistory(); isDrawingRef.current = false; isPanningRef.current = false; };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const canvas = displayCanvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const newScale = e.deltaY < 0 ? transform.scale * 1.1 : transform.scale / 1.1;
    setTransform({ scale: newScale, offsetX: mouseX - (mouseX - transform.offsetX) * (newScale / transform.scale), offsetY: mouseY - (mouseY - transform.offsetY) * (newScale / transform.scale) });
  };
  
  const handleClear = () => { const maskCtx = maskCanvasRef.current?.getContext('2d', { willReadFrequently: true }); if (maskCtx) { maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height); redrawDisplay(); pushHistory(); } };

  const handleApply = async () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !inpaintPrompt.trim()) { alert("Please provide an inpaint prompt and draw a mask."); return; }
    setIsRegenerating(true); setApiStatus('PENDING');
    try {
        // FIX: Replaced performInpainting with performInpaintingBlend and adjusted arguments.
        const newImageDataUrl = await performInpaintingBlend(imageSrc, maskCanvas.toDataURL('image/png'), inpaintPrompt, resolution);
        onApply(newImageDataUrl); setApiStatus('SUCCESS');
    } catch(error) {
        alert(`In-painting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setApiStatus('ERROR');
    } finally { setIsRegenerating(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-2 sm:p-4 animate-fade-in-fast" onMouseDown={onClose}>
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl w-full h-full flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-white">{t.inpaintTitle}</h3>
            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-amber-400 font-mono border border-slate-600">Mode: {resolution}</span>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-md flex flex-col lg:flex-row items-center justify-between flex-wrap gap-3 mb-3 border border-slate-700">
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto"><button onClick={() => setTool('brush')} className={`p-2 rounded-md ${tool === 'brush' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`} title="Brush"><BrushIcon className="w-5 h-5"/></button><button onClick={() => setTool('eraser')} className={`p-2 rounded-md ${tool === 'eraser' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`} title="Eraser"><EraserIcon className="w-5 h-5"/></button><div className="h-6 w-px bg-slate-600 mx-2"></div><button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50" title="Undo">↶</button><button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50" title="Redo">↷</button><div className="h-6 w-px bg-slate-600 mx-2"></div><button onClick={handleClear} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600" title="Clear"><TrashIcon className="w-5 h-5"/></button></div>
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-end w-full lg:w-auto"><div className="flex items-center gap-2 text-white text-sm"><label htmlFor="brushSize">{t.brushSize}</label><input type="range" id="brushSize" min="2" max="200" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-24 sm:w-32"/></div><div className="flex items-center gap-2 text-white text-sm"><label htmlFor="feather">{t.feather}</label><input type="range" id="feather" min="0" max="100" value={feather} onChange={(e) => setFeather(Number(e.target.value))} className="w-24 sm:w-32"/></div></div>
        </div>
        <div className="mb-3"><textarea placeholder={t.inpaintPlaceholder} value={inpaintPrompt} onChange={(e) => setInpaintPrompt(e.target.value)} rows={2} className="w-full p-2 border border-slate-600 bg-slate-900 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm placeholder:text-slate-500" /></div>
        <div ref={containerRef} className="flex-grow w-full min-h-0 flex items-center justify-center bg-black/50 rounded relative overflow-hidden touch-none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel} style={{ cursor: isPanningRef.current ? 'grabbing' : cursorStyle }}><canvas ref={displayCanvasRef} className="absolute top-0 left-0" /><canvas ref={maskCanvasRef} style={{ display: 'none' }} /></div>
        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-end items-center"><button onClick={onClose} className="text-slate-300 px-4 py-2 rounded-md hover:bg-slate-700 mr-2 font-semibold">{t.cancel}</button><button onClick={handleApply} disabled={isRegenerating} className="bg-amber-500 text-slate-900 px-6 py-2 rounded-md hover:bg-amber-600 font-semibold flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"><GenerateIcon className="w-5 h-5" />{isRegenerating ? t.processing : t.applyChanges}</button></div>
      </div>
      <style>{`@keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in-fast { animation: fadeInFast 0.2s ease-out forwards; } .touch-none { touch-action: none; }`}</style>
    </div>
  );
};