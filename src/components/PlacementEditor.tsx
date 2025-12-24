import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Rect } from '../types';
import { CheckCircleIcon, XCircleIcon, RefreshIcon, CubeIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface PlacementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (adjustedBox: Rect) => void;
  sceneImageSrc: string;
  initialBox: Rect;
}

type Handle = 'topLeft' | 'top' | 'topRight' | 'left' | 'right' | 'bottomLeft' | 'bottom' | 'bottomRight' | 'move';

const MIN_BOX_SIZE = 20;

export const PlacementEditor: React.FC<PlacementEditorProps> = ({ isOpen, onClose, onApply, sceneImageSrc, initialBox }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [box, setBox] = useState<Rect>(initialBox);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1, scale: 1 });
  const [cursor, setCursor] = useState('auto');

  const activeHandleRef = useRef<Handle | null>(null);
  const dragStartRef = useRef<{ pointerX: number, pointerY: number, box: Rect } | null>(null);

  // Skalakan initialBox dari piksel gambar asli ke piksel gambar yang ditampilkan
  const scaleInitialBox = useCallback(() => {
    if (!imageRef.current) return;
    const { naturalWidth, naturalHeight } = imageRef.current;
    const { width: displayWidth, height: displayHeight } = imageSize;
    
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    setBox({
      x: initialBox.x * scaleX,
      y: initialBox.y * scaleY,
      width: initialBox.width * scaleX,
      height: initialBox.height * scaleY,
    });
  }, [initialBox, imageSize]);

  // Perbarui ukuran gambar yang ditampilkan saat container/window di-resize
  const updateSizes = useCallback(() => {
    if (!containerRef.current || !imageRef.current || !imageRef.current.naturalWidth) return;
    
    const { clientWidth: cW, clientHeight: cH } = containerRef.current;
    const { naturalWidth: nW, naturalHeight: nH } = imageRef.current;
    
    const imgRatio = nW / nH;
    const contRatio = cW / cH;
    
    let iW, iH;
    if (imgRatio > contRatio) {
      iW = cW;
      iH = cW / imgRatio;
    } else {
      iH = cH;
      iW = cH * imgRatio;
    }

    setImageSize({ width: iW, height: iH, scale: iW / nW });
  }, []);
  
  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.src = sceneImageSrc;
    img.onload = () => {
      imageRef.current = img;
      updateSizes();
    };
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [isOpen, sceneImageSrc, updateSizes]);

  // Setelah ukuran gambar di-set, skalakan initial box
  useEffect(() => {
    if (imageSize.width > 1) {
      scaleInitialBox();
    }
  }, [imageSize, scaleInitialBox]);

  const getHandleAtPosition = (x: number, y: number, b: Rect): Handle | null => {
      const handleRadius = 12;
      if (x > b.x && x < b.x + b.width && y > b.y && y < b.y + b.height) {
        // Cek sudut dan sisi dulu untuk prioritas
        if (Math.abs(x - b.x) < handleRadius && Math.abs(y - b.y) < handleRadius) return 'topLeft';
        if (Math.abs(x - (b.x + b.width)) < handleRadius && Math.abs(y - b.y) < handleRadius) return 'topRight';
        if (Math.abs(x - b.x) < handleRadius && Math.abs(y - (b.y + b.height)) < handleRadius) return 'bottomLeft';
        if (Math.abs(x - (b.x + b.width)) < handleRadius && Math.abs(y - (b.y + b.height)) < handleRadius) return 'bottomRight';
        if (Math.abs(y - b.y) < handleRadius) return 'top';
        if (Math.abs(y - (b.y + b.height)) < handleRadius) return 'bottom';
        if (Math.abs(x - b.x) < handleRadius) return 'left';
        if (Math.abs(x - (b.x + b.width)) < handleRadius) return 'right';
        return 'move';
      }
      return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getHandleAtPosition(x, y, box);
    if (handle) {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      activeHandleRef.current = handle;
      dragStartRef.current = { pointerX: e.clientX, pointerY: e.clientY, box };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!activeHandleRef.current) {
        const handle = getHandleAtPosition(x, y, box);
        if (!handle) setCursor('auto');
        else if (handle === 'move') setCursor('move');
        else if (handle === 'topLeft' || handle === 'bottomRight') setCursor('nwse-resize');
        else if (handle === 'topRight' || handle === 'bottomLeft') setCursor('nesw-resize');
        else if (handle === 'top' || handle === 'bottom') setCursor('ns-resize');
        else if (handle === 'left' || handle === 'right') setCursor('ew-resize');
        return;
    }

    if (!dragStartRef.current) return;
    const { pointerX, pointerY, box: startBox } = dragStartRef.current;
    const dx = e.clientX - pointerX;
    const dy = e.clientY - pointerY;
    let newBox = { ...startBox };

    const handle = activeHandleRef.current;
    if (handle === 'move') { newBox.x += dx; newBox.y += dy; } 
    else {
      if (handle.includes('left')) { newBox.x += dx; newBox.width -= dx; }
      if (handle.includes('right')) { newBox.width += dx; }
      if (handle.includes('top')) { newBox.y += dy; newBox.height -= dy; }
      if (handle.includes('bottom')) { newBox.height += dy; }

      if (newBox.width < MIN_BOX_SIZE) { if (handle.includes('left')) newBox.x = startBox.x + startBox.width - MIN_BOX_SIZE; newBox.width = MIN_BOX_SIZE; }
      if (newBox.height < MIN_BOX_SIZE) { if (handle.includes('top')) newBox.y = startBox.y + startBox.height - MIN_BOX_SIZE; newBox.height = MIN_BOX_SIZE; }
    }
    
    newBox.x = Math.max(0, Math.min(newBox.x, imageSize.width - newBox.width));
    newBox.y = Math.max(0, Math.min(newBox.y, imageSize.height - newBox.height));
    setBox(newBox);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandleRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      activeHandleRef.current = null;
    }
  };
  
  const handleApply = () => {
    const scale = imageRef.current!.naturalWidth / imageSize.width;
    const finalBox: Rect = {
      x: box.x * scale, y: box.y * scale,
      width: box.width * scale, height: box.height * scale,
    };
    onApply(finalBox);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4 animate-fade-in-fast" onPointerDown={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><CubeIcon className="w-4 h-4 text-amber-500" />KONFIRMASI PENEMPATAN SUBJEK</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><XCircleIcon className="w-6 h-6" /></button>
        </div>
        <p className="text-xs text-slate-400 bg-slate-800 px-4 py-2">Seret kotak untuk memindahkan atau seret tepinya untuk mengubah ukuran. Ini adalah area di mana subjek akan ditempatkan.</p>
        <div ref={containerRef} className="flex-grow w-full relative bg-black flex items-center justify-center overflow-hidden">
          {imageRef.current && (
            <div
              className="relative touch-none"
              style={{ width: imageSize.width, height: imageSize.height, cursor: cursor }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img src={sceneImageSrc} alt="Scene" className="pointer-events-none select-none w-full h-full" />
              <div 
                className="absolute border-2 border-amber-500 shadow-2xl"
                style={{
                    transform: `translate(${box.x}px, ${box.y}px)`,
                    width: box.width,
                    height: box.height,
                    pointerEvents: 'none' 
                }}
              >
                 <div className="absolute inset-0 bg-amber-500/10"></div>
                 {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(h => <div key={h} className="absolute bg-amber-500 w-2.5 h-2.5 -m-1.5 rounded-full" style={{ top: h.includes('bottom') ? '100%' : '0%', left: h.includes('right') ? '100%' : '0%' }} />)}
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
            <button onClick={scaleInitialBox} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors" title="Reset"><RefreshIcon className="w-4 h-4" />RESET</button>
            <div className="flex items-center gap-3">
                <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded transition-colors">{t.cancel}</button>
                <button onClick={handleApply} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-6 py-2 rounded transition-colors shadow-lg shadow-amber-900/20"><CheckCircleIcon className="w-4 h-4" />TERAPKAN & LANJUTKAN</button>
            </div>
        </div>
      </div>
      <style>{`@keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in-fast { animation: fadeInFast 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; } .touch-none { touch-action: none; }`}</style>
    </div>
  );
};
