
import type { AspectRatio, FileWithPreview, PerspectiveAnalysisData } from '../types';

export const detectImageAspectRatio = (file: FileWithPreview): Promise<AspectRatio> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = img.naturalWidth / img.naturalHeight;
      const targets: { id: AspectRatio; value: number }[] = [
        { id: '16:9', value: 16 / 9 }, { id: '9:16', value: 9 / 16 },
        { id: '4:3', value: 4 / 3 }, { id: '3:4', value: 3 / 4 },
        { id: '1:1', value: 1.0 },
      ];
      const closest = targets.reduce((prev, curr) => 
        Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev
      );
      resolve(closest.id);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('16:9');
    }
  });
};

export const optimizeImage = (
    file: File | Blob, 
    maxDimension: number = 1536, 
    initialQuality: number = 0.85
): Promise<File | Blob> => {
    return new Promise((resolve) => {
        if (!(file instanceof Blob)) return resolve(file as any);
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            try {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) { if (width > maxDimension) { height *= maxDimension / width; width = maxDimension; } }
                else { if (height > maxDimension) { width *= maxDimension / height; height = maxDimension; } }
                canvas.width = Math.round(width); canvas.height = Math.round(height);
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(file);
                ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    resolve(new File([blob], "opt.jpg", { type: 'image/jpeg' }));
                }, 'image/jpeg', initialQuality);
            } catch (error) { resolve(file); }
        };
        img.src = url;
    });
};

/**
 * [UPGRADED v12.54] VAULT STASIS PROTOCOL
 * Menciptakan lubang hitam dengan batas pixel yang sangat tajam untuk mengunci latar belakang.
 */
export const preCompositeImage = async (
  subjectFile: FileWithPreview,
  sceneSource: FileWithPreview | string,
  boundingBox: { x_min: number; y_min: number; x_max: number; y_max: number; },
  shadowQuality: string,
  perspective: PerspectiveAnalysisData | undefined | null,
  subjectCropBox?: { x_min: number; y_min: number; x_max: number; y_max: number; } | null,
  interactionMaskUrl?: string | null,
  isReplaceMode: boolean = false
): Promise<{ compositeImage: string; maskImage: string; width: number; height: number; }> => {
    const sceneImg = new Image();
    const sceneSrc = typeof sceneSource === 'string' ? sceneSource : sceneSource.preview;

    await new Promise(res => { sceneImg.onload = res; sceneImg.src = sceneSrc; });

    const canvasW = Math.round(sceneImg.naturalWidth);
    const canvasH = Math.round(sceneImg.naturalHeight);
    
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasW; compositeCanvas.height = canvasH;
    const compositeCtx = compositeCanvas.getContext('2d')!;

    // 1. Render Dasar Scene (Original) - Ini adalah jangkar utama kita.
    compositeCtx.drawImage(sceneImg, 0, 0, canvasW, canvasH);

    // 2. [V12.54] CRISP SURGICAL HOLE
    // Kita kurangi sedikit padding agar AI tidak terlalu banyak 'menyentuh' area luar subjek.
    const pad = 0.08; 
    const hX = Math.max(0, (boundingBox.x_min - pad) * canvasW);
    const hY = Math.max(0, (boundingBox.y_min - pad) * canvasH);
    const hW = Math.min(canvasW, (boundingBox.x_max - boundingBox.x_min + (pad * 2)) * canvasW);
    const hH = Math.min(canvasH, (boundingBox.y_max - boundingBox.y_min + (pad * 2)) * canvasH);
    
    // V12.54: GUNAKAN BATAS TAJAM (Tanpa Shadow Blur)
    // Ini memberitahu AI: "Hanya pixel di dalam kotak ini yang boleh kamu ubah."
    compositeCtx.fillStyle = '#000000';
    compositeCtx.fillRect(hX, hY, hW, hH);

    // 3. MASKER KERJA (Pixel-Perfect Match)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvasW; maskCanvas.height = canvasH;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.fillStyle = '#000000'; 
    maskCtx.fillRect(0, 0, canvasW, canvasH);
    
    maskCtx.fillStyle = '#FFFFFF';
    maskCtx.fillRect(hX, hY, hW, hH);

    return {
        compositeImage: compositeCanvas.toDataURL('image/jpeg', 1.0), // Gunakan kualitas maksimal
        maskImage: maskCanvas.toDataURL('image/png'),
        width: canvasW,
        height: canvasH
    };
};
