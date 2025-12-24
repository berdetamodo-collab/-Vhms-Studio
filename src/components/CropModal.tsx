import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CropIcon, RefreshIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApply: (croppedDataUrl: string) => void;
}

interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }

const HANDLE_SIZE = 12;
const MIN_CROP_SIZE = 1;

type Handle = 'topLeft' | 'top' | 'topRight' | 'left' | 'right' | 'bottomLeft' | 'bottom' | 'bottomRight' | 'move';
type AspectRatioOption = 'Free' | 1 | 0.75 | 0.5625;

export const CropModal: React.FC<CropModalProps> = ({ isOpen, onClose, imageSrc, onApply }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [crop, setCrop] = useState<Rect>({ x: 20, y: 20, width: 200, height: 200 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('Free');
  const [showGrid, setShowGrid] = useState(true);
  
  const activeHandleRef = useRef<Handle | null>(null);
  const dragStartRef = useRef<{ pointer: Point, crop: Rect, aspect: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(crop.x, crop.y, crop.width, crop.height);
    ctx.fill('evenodd');
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    
    if (showGrid) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.moveTo(crop.x + crop.width / 3, crop.y);
        ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
        ctx.moveTo(crop.x + (crop.width / 3) * 2, crop.y);
        ctx.lineTo(crop.x + (crop.width / 3) * 2, crop.y + crop.height);
        ctx.moveTo(crop.x, crop.y + crop.height / 3);
        ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
        ctx.moveTo(crop.x, crop.y + (crop.height / 3) * 2);
        ctx.lineTo(crop.x + crop.width, crop.y + (crop.height / 3) * 2);
        ctx.stroke();
    }

    ctx.fillStyle = '#f59e0b';
    const half = HANDLE_SIZE / 2;
    const handles = {
      topLeft:     { x: crop.x - half, y: crop.y - half },
      top:         { x: crop.x + crop.width / 2 - half, y: crop.y - half },
      topRight:    { x: crop.x + crop.width - half, y: crop.y - half },
      left:        { x: crop.x - half, y: crop.y + crop.height / 2 - half },
      right:       { x: crop.x + crop.width - half, y: crop.y + crop.height / 2 - half },
      bottomLeft:  { x: crop.x - half, y: crop.y + crop.height - half },
      bottom:      { x: crop.x + crop.width / 2 - half, y: crop.y + crop.height - half },
      bottomRight: { x: crop.x + crop.width - half, y: crop.y + crop.height - half },
    };
    Object.values(handles).forEach(handle => {
      ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    });
  }, [crop, showGrid]);
  
  useEffect(() => {
    if (!isOpen) return;
    const image = new Image();
    image.src = imageSrc;
    imageRef.current = image;

    image.onload = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const contW = container.clientWidth;
      const contH = container.clientHeight;
      const imgRatio = image.naturalWidth / image.naturalHeight;
      const contRatio = contW / contH;
      
      let canvasWidth, canvasHeight;
      if (imgRatio > contRatio) {
        canvasWidth = contW;
        canvasHeight = contW / imgRatio;
      } else {
        canvasHeight = contH;
        canvasWidth = contH * imgRatio;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const initialSize = Math.min(canvasWidth, canvasHeight) * 0.75;
      setCrop({
        x: (canvasWidth - initialSize) / 2,
        y: (canvasHeight - initialSize) / 2,
        width: initialSize,
        height: initialSize
      });
    };
  }, [isOpen, imageSrc]);

  useEffect(() => {
    requestAnimationFrame(draw);
  }, [crop, draw]);

  const getPointerPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  
  const getHandleAtPosition = (pos: Point): Handle | null => {
      const half = HANDLE_SIZE / 2;
      const handles = {
          topLeft:     { x: crop.x - half, y: crop.y - half },
          top:         { x: crop.x + crop.width / 2 - half, y: crop.y - half },
          topRight:    { x: crop.x + crop.width - half, y: crop.y - half },
          left:        { x: crop.x - half, y: crop.y + crop.height / 2 - half },
          right:       { x: crop.x + crop.width - half, y: crop.y + crop.height / 2 - half },
          bottomLeft:  { x: crop.x - half, y: crop.y + crop.height - half },
          bottom:      { x: crop.x + crop.width / 2 - half, y: crop.y + crop.height - half },
          bottomRight: { x: crop.x + crop.width - half, y: crop.y + crop.height - half },
      };

      for (const [name, rectPos] of Object.entries(handles)) {
          if (pos.x >= rectPos.x && pos.x <= rectPos.x + HANDLE_SIZE && pos.y >= rectPos.y && pos.y <= rectPos.y + HANDLE_SIZE) {
              return name as Handle;
          }
      }
      if (pos.x >= crop.x && pos.x <= crop.x + crop.width && pos.y >= crop.y && pos.y <= crop.y + crop.height) {
          return 'move';
      }
      return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    const handle = getHandleAtPosition(pos);
    if (handle) {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      activeHandleRef.current = handle;
      dragStartRef.current = { pointer: pos, crop, aspect: crop.width / crop.height };
    }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getPointerPos(e);
    const activeHandle = activeHandleRef.current;

    if (!activeHandle) {
      const handle = getHandleAtPosition(pos);
      if (!handle) canvas.style.cursor = 'default';
      else if (handle === 'move') canvas.style.cursor = 'move';
      else if (handle === 'topLeft' || handle === 'bottomRight') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'topRight' || handle === 'bottomLeft') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'top' || handle === 'bottom') canvas.style.cursor = 'ns-resize';
      else if (handle === 'left' || handle === 'right') canvas.style.cursor = 'ew-resize';
      return;
    }

    if (dragStartRef.current) {
      const { pointer: startPointer, crop: startCrop, aspect } = dragStartRef.current;
      const dx = pos.x - startPointer.x;
      const dy = pos.y - startPointer.y;
      
      let newCrop = { ...startCrop };

      const h = activeHandle.toLowerCase();

      if (activeHandle === 'move') {
          newCrop.x = startCrop.x + dx;
          newCrop.y = startCrop.y + dy;
      } else {
          let proposedWidth = startCrop.width;
          let proposedHeight = startCrop.height;
          let proposedX = startCrop.x;
          let proposedY = startCrop.y;

          if (h.includes('right')) proposedWidth = startCrop.width + dx;
          if (h.includes('left')) { proposedWidth = startCrop.width - dx; proposedX = startCrop.x + dx; }
          if (h.includes('bottom')) proposedHeight = startCrop.height + dy;
          if (h.includes('top')) { proposedHeight = startCrop.height - dy; proposedY = startCrop.y + dy; }

          if (aspectRatio !== 'Free') {
              const ratio = aspectRatio as number;
              if (activeHandle === 'topRight' || activeHandle === 'bottomRight' || activeHandle === 'right' || activeHandle === 'left') {
                  proposedHeight = proposedWidth / ratio;
                  if (h.includes('top')) proposedY = startCrop.y + startCrop.height - proposedHeight;
              } else if (activeHandle === 'bottomLeft' || activeHandle === 'topLeft' || activeHandle === 'top' || activeHandle === 'bottom') {
                  proposedWidth = proposedHeight * ratio;
                   if (h.includes('left')) proposedX = startCrop.x + startCrop.width - proposedWidth;
              }
          }

          if (proposedWidth < MIN_CROP_SIZE) proposedWidth = MIN_CROP_SIZE;
          if (proposedHeight < MIN_CROP_SIZE) proposedHeight = MIN_CROP_SIZE;
          
          if (h.includes('left')) proposedX = startCrop.x + startCrop.width - proposedWidth;
          if (h.includes('top')) proposedY = startCrop.y + startCrop.height - proposedHeight;

          newCrop = { x: proposedX, y: proposedY, width: proposedWidth, height: proposedHeight };
      }

      if (newCrop.x < 0) newCrop.x = 0;
      if (newCrop.y < 0) newCrop.y = 0;
      if (newCrop.x + newCrop.width > canvas.width) newCrop.width = canvas.width - newCrop.x;
      if (newCrop.y + newCrop.height > canvas.height) newCrop.height = canvas.height - newCrop.y;

      setCrop(newCrop);
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    if(activeHandleRef.current){
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      activeHandleRef.current = null;
    }
  };
  
  const handleApplyCrop = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    const scaleX = image.naturalWidth / canvas.width;
    const scaleY = image.naturalHeight / canvas.height;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = crop.width * scaleX;
    tempCanvas.height = crop.height * scaleY;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, tempCanvas.width, tempCanvas.height);
      onApply(tempCanvas.toDataURL('image/png'));
    }
  };

  const setRatio = (r: AspectRatioOption) => {
      setAspectRatio(r);
      if (r === 'Free' || !canvasRef.current) return;
      const ratio = r as number;
      let newW = crop.width;
      let newH = newW / ratio;
      if (crop.y + newH > canvasRef.current.height) {
          newH = canvasRef.current.height - crop.y;
          newW = newH * ratio;
      }
       if (crop.x + newW > canvasRef.current.width) {
          newW = canvasRef.current.width - crop.x;
          newH = newW / ratio;
      }
      setCrop({ ...crop, width: newW, height: newH });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4 animate-fade-in-fast" onPointerDown={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-amber-500" />
            {t.cropRefine}
          </h3>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowGrid(!showGrid)} className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${showGrid ? 'bg-slate-700 text-amber-400 border-slate-600' : 'text-slate-500 border-transparent hover:text-slate-300'}`}># GRID</button>
             <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><XCircleIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div ref={containerRef} className="flex-grow w-full relative bg-black flex items-center justify-center overflow-hidden touch-none">
          <canvas ref={canvasRef} className="touch-none shadow-2xl" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} />
        </div>
        <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-md border border-slate-700">
                <span className="text-[9px] font-bold text-slate-500 px-2">{t.ratio}:</span>
                {[{ label: 'Free', val: 'Free' }, { label: '1:1', val: 1 }, { label: '3:4', val: 0.75 }, { label: '9:16', val: 0.5625 }].map((opt) => (
                    <button key={opt.label} onClick={() => setRatio(opt.val as AspectRatioOption)} className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all ${aspectRatio === opt.val ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>{opt.label}</button>
                ))}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => setCrop({x: 20, y: 20, width: 200, height: 200})} className="p-2 text-slate-400 hover:text-white transition-colors" title="Reset"><RefreshIcon className="w-4 h-4" /></button>
                <div className="h-6 w-px bg-slate-700 mx-1"></div>
                <button onClick={onClose} className="flex-1 sm:flex-none text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded transition-colors">{t.cancel}</button>
                <button onClick={handleApplyCrop} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-6 py-2 rounded transition-colors shadow-lg shadow-amber-900/20"><CheckCircleIcon className="w-4 h-4" />{t.applyCrop}</button>
            </div>
        </div>
      </div>
      <style>{`@keyframes fadeInFast { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-fast { animation: fadeInFast 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
    </div>
  );
};