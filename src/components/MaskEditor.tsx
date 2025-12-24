import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushIcon, TrashIcon, MagicWandIcon, InfoCircleIcon, EraserIcon, CheckCircleIcon, XCircleIcon, RefreshIcon } from './icons/Icons';
import { generateObjectMask } from '../services/geminiService';
import type { FileWithPreview, ApiStatus, DepthAnalysis } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Transform { scale: number; offsetX: number; offsetY: number; }
interface MaskEditorProps { isOpen: boolean; onClose: () => void; imageSrc: string; onApply: (maskDataUrl: string) => void; occlusionData?: DepthAnalysis; sceneImage: FileWithPreview; setApiStatus: (status: ApiStatus) => void; }

const HISTORY_LIMIT = 20;

export const MaskEditor: React.FC<MaskEditorProps> = ({ isOpen, onClose, imageSrc, onApply, occlusionData, sceneImage, setApiStatus }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(40);
  const [transform, setTransform] = useState<Transform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isAutoMasking, setIsAutoMasking] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // --- CORE LOGIC: Rendering & Anti-Blank ---

  const redrawDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    if (!displayCanvas || !maskCanvas || !image) return;
    
    const ctx = displayCanvas.getContext('2d'); 
    if (!ctx) return;
    
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    // Background Hitam agar batas gambar jelas
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

    ctx.save(); 
    // Apply Transform: Center -> Scale
    ctx.translate(transform.offsetX, transform.offsetY); 
    ctx.scale(transform.scale, transform.scale);
    
    // 1. Gambar Asli
    ctx.drawImage(image, 0, 0);
    
    // 2. Overlay Masker
    ctx.globalAlpha = 0.6; 
    ctx.drawImage(maskCanvas, 0, 0); 
    
    // 3. Highlight Masker Merah
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ef4444'; // Red color
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    ctx.restore();
  }, [transform]);

  const fitImageToContainer = useCallback(() => {
      const container = containerRef.current;
      const img = imageRef.current;
      if (!container || !img || img.naturalWidth === 0) return;

      const padding = 20;
      const availableWidth = container.clientWidth - padding;
      const availableHeight = container.clientHeight - padding;
      
      const scaleX = availableWidth / img.naturalWidth;
      const scaleY = availableHeight / img.naturalHeight;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = (container.clientWidth - (img.naturalWidth * scale)) / 2;
      const offsetY = (container.clientHeight - (img.naturalHeight * scale)) / 2;
      
      setTransform({ scale: scale || 0.1, offsetX, offsetY });
  }, []);

  // --- INITIALIZATION ---

  useEffect(() => {
    if (!isOpen) return;
    
    if (occlusionData?.occlusionSuggestion) {
      setShowSuggestion(true);
    }
    
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      
      // Resize canvases to match image resolution
      if (displayCanvasRef.current && maskCanvasRef.current) {
          displayCanvasRef.current.width = containerRef.current?.clientWidth || window.innerWidth;
          displayCanvasRef.current.height = containerRef.current?.clientHeight || window.innerHeight;
          
          maskCanvasRef.current.width = img.naturalWidth;
          maskCanvasRef.current.height = img.naturalHeight;
          
          // Init blank history
          const maskCtx = maskCanvasRef.current.getContext('2d', { willReadFrequently: true });
          if (maskCtx) {
             maskCtx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
             setHistory([maskCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)]);
             setHistoryIndex(0);
          }
      }
      
      fitImageToContainer();
      // Retry fitting to prevent blank screen race conditions
      setTimeout(fitImageToContainer, 100);
      setTimeout(fitImageToContainer, 300);
    };
  }, [isOpen, imageSrc, fitImageToContainer, occlusionData]);

  useEffect(() => {
      // Resize observer handles rotation/window resize
      const handleResize = () => { 
          if(displayCanvasRef.current && containerRef.current) {
              displayCanvasRef.current.width = containerRef.current.clientWidth;
              displayCanvasRef.current.height = containerRef.current.clientHeight;
          }
          fitImageToContainer(); 
          requestAnimationFrame(redrawDisplay); 
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [fitImageToContainer, redrawDisplay]);

  useEffect(() => {
      if (isOpen && imageRef.current) requestAnimationFrame(redrawDisplay);
  }, [transform, redrawDisplay, isOpen]);


  // --- TOOLS & DRAWING ---

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    // Map screen coords to image coords based on transform
    return { 
        x: (clientX - rect.left - transform.offsetX) / transform.scale, 
        y: (clientY - rect.top - transform.offsetY) / transform.scale 
    };
  };

  const drawOnMask = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const ctx = maskCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize; // Brush size is in image pixels
    
    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(end.x, end.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Two fingers or Alt key = Pan
    if ((e.pointerType === 'touch' && !e.isPrimary) || e.button === 1 || e.altKey) {
        isPanningRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        return;
    }

    isDrawingRef.current = true;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    lastPosRef.current = coords;
    drawOnMask(coords, coords);
    redrawDisplay();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningRef.current && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setTransform(t => ({ ...t, offsetX: t.offsetX + dx, offsetY: t.offsetY + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        return;
    } 
    
    if (isDrawingRef.current) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        drawOnMask(lastPosRef.current, coords);
        lastPosRef.current = coords;
        redrawDisplay();
    }
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
        // Save History
        const maskCanvas = maskCanvasRef.current;
        const ctx = maskCanvas?.getContext('2d');
        if (maskCanvas && ctx) {
            setHistory(prev => {
                const newH = prev.slice(0, historyIndex + 1);
                newH.push(ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
                if (newH.length > HISTORY_LIMIT) newH.shift();
                setHistoryIndex(newH.length - 1);
                return newH;
            });
        }
    }
    isDrawingRef.current = false;
    isPanningRef.current = false;
    dragStartRef.current = null;
  };

  // --- ACTIONS ---

  const handleAutoMask = async () => {
      if (isAutoMasking) return;
      setIsAutoMasking(true);
      setApiStatus('PENDING');
      setMessage({ text: "AI sedang membuat masker...", type: 'info' });

      try {
          const prompt = occlusionData?.occlusionMaskPrompt || 
                         `Generate a precise black and white mask for the main foreground object in this scene. The object must be solid white. Everything else must be solid black.`;
          
          const maskUrl = await generateObjectMask(sceneImage, prompt);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = maskUrl;
          img.onload = () => {
              const ctx = maskCanvasRef.current?.getContext('2d');
              if (ctx && maskCanvasRef.current) {
                  ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
                  ctx.drawImage(img, 0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
                  
                  const snap = ctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
                  setHistory(prev => {
                    const newH = prev.slice(0, historyIndex + 1);
                    newH.push(snap);
                    if (newH.length > HISTORY_LIMIT) newH.shift();
                    setHistoryIndex(newH.length - 1);
                    return newH;
                  });
                  
                  redrawDisplay();
                  setMessage({ text: "Auto-Mask Selesai!", type: 'success' });
                  setApiStatus('SUCCESS');
                  setTimeout(() => setMessage(null), 2000);
              }
          };
          img.onerror = () => {
            throw new Error("Failed to load generated mask image.");
          }
      } catch (e) {
          setMessage({ text: "Gagal membuat masker otomatis.", type: 'error' });
          setApiStatus('ERROR');
          console.error("Auto-masking failed:", e);
      } finally {
          setIsAutoMasking(false);
      }
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          const idx = historyIndex - 1;
          setHistoryIndex(idx);
          const ctx = maskCanvasRef.current?.getContext('2d');
          if (ctx && history[idx]) {
              ctx.putImageData(history[idx], 0, 0);
              redrawDisplay();
          }
      }
  };

  const handleApply = () => {
      if (maskCanvasRef.current) {
          onApply(maskCanvasRef.current.toDataURL('image/png'));
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col h-[100dvh] w-screen touch-none">
        
        {/* HEADER: Title & Save */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-4 shrink-0 z-20 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BrushIcon className="w-4 h-4 text-amber-500" />
                MASK EDITOR
            </h3>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-md transition-colors border border-transparent hover:border-slate-700">
                    BATAL
                </button>
                <button onClick={handleApply} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded-md text-xs font-bold shadow-md flex items-center gap-2 active:scale-95 transition-transform">
                    <CheckCircleIcon className="w-4 h-4" />
                    SIMPAN
                </button>
            </div>
        </div>

        {/* CANVAS AREA */}
        <div 
            ref={containerRef}
            className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <canvas ref={displayCanvasRef} className="absolute pointer-events-none" />
            <canvas ref={maskCanvasRef} className="hidden" />

            {showSuggestion && occlusionData?.occlusionSuggestion && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 pointer-events-none">
                  <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-lg p-3 flex items-start gap-3 shadow-2xl pointer-events-auto animate-fade-in-down">
                      <div className="flex-shrink-0 pt-0.5">
                          <InfoCircleIcon className="w-5 h-5 text-amber-400"/>
                      </div>
                      <div className="flex-grow">
                          <p className="text-xs font-bold text-amber-400">AI Occlusion Suggestion</p>
                          <p className="text-sm text-slate-200 mt-1">
                              To place the subject realistically, try creating a mask over the <span className="font-bold text-white">"{occlusionData.occlusionSuggestion}"</span>.
                          </p>
                      </div>
                      <button onClick={() => setShowSuggestion(false)} className="p-1 -m-1 text-slate-500 hover:text-white flex-shrink-0 pointer-events-auto">
                          <XCircleIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
            )}
            
            {message && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold shadow-xl z-30 flex items-center gap-2 transition-all duration-300 ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}
                style={{ animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                >
                    <InfoCircleIcon className="w-4 h-4"/> {message.text}
                </div>
            )}
        </div>

        {/* TOOLBAR: Simple Controls */}
        <div className="bg-slate-900 border-t border-slate-800 p-2 pb-safe shrink-0 z-20 flex flex-col gap-2">
            
            {/* Brush Size Slider (Only visible for manual) */}
            <div className="flex items-center justify-center px-4 py-1 gap-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Size</span>
                <input 
                    type="range" min="10" max="300" step="10" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))} 
                    className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>

            <div className="flex items-center justify-between px-2 gap-2">
                {/* AUTO */}
                <button 
                    onClick={handleAutoMask}
                    disabled={isAutoMasking || !occlusionData?.occlusionMaskPrompt}
                    title={!occlusionData?.occlusionMaskPrompt ? "Auto-Mask dinonaktifkan: tidak ada saran oklusi dari AI." : "Gunakan AI untuk membuat masker secara otomatis"}
                    className={`flex-1 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isAutoMasking ? 'bg-slate-800 border-slate-700' : 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'}`}
                >
                    {isAutoMasking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <MagicWandIcon className="w-5 h-5"/>}
                    <span className="text-[10px] font-bold uppercase">AUTO MASK</span>
                </button>

                <div className="w-px h-8 bg-slate-700 mx-1"></div>

                {/* MANUAL */}
                <button onClick={() => setTool('brush')} className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${tool === 'brush' ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-400'}`}>
                    <BrushIcon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">GAMBAR</span>
                </button>

                <button onClick={() => setTool('eraser')} className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${tool === 'eraser' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'}`}>
                    <EraserIcon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">HAPUS</span>
                </button>

                <div className="w-px h-8 bg-slate-700 mx-1"></div>

                {/* UNDO */}
                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                    <RefreshIcon className="w-5 h-5 -scale-x-100" />
                </button>
            </div>
        </div>
        <style>{`
          .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-fade-in-down { animation: fadeInDown 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
          @keyframes bounceIn {
            0% { transform: translate(-50%, -20px) scale(0.8); opacity: 0; }
            80% { transform: translate(-50%, 5px) scale(1.05); opacity: 1; }
            100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          }
        `}</style>
    </div>
  );
};