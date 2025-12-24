// src/modules/prompt/dynamicNegativePrompt.ts
import type { UnifiedAnalysisData } from '../../types';
import { logger } from '../../utils/logger';

/**
 * Menganalisis data dan prompt untuk secara dinamis menghasilkan prompt negatif yang relevan secara kontekstual.
 * Tujuannya adalah untuk secara proaktif mengurangi artefak umum berdasarkan gaya referensi dan niat pengguna.
 * @param analysisData Data analisis terpadu dari gambar referensi.
 * @param userPrompt Prompt positif dari pengguna.
 * @param staticNegativePrompt Prompt negatif yang dimasukkan secara manual oleh pengguna.
 * @returns String prompt negatif gabungan yang telah disempurnakan.
 */
export function generateDynamicNegativePrompt(
  analysisData: UnifiedAnalysisData | null,
  userPrompt: string,
  staticNegativePrompt?: string
): string {
  const dynamicPrompts = new Set<string>();
  const lowerUserPrompt = userPrompt.toLowerCase();

  if (analysisData) {
    // FIX: Menggunakan lensDistortion karena cameraShot tidak ada dalam UnifiedAnalysisData.
    // Aturan 1: Mencegah distorsi pada lensa wide-angle (Barrel Distortion)
    const distortion = analysisData.lensDistortion?.distortionType;
    if (distortion === 'barrel') {
      dynamicPrompts.add("distorsi perspektif berlebihan");
      dynamicPrompts.add("wajah memanjang di pinggir");
      logger.engine.info("Aturan Negatif Dinamis: Lensa Wide-Angle (Distorsi Barrel) Terdeteksi.", { distortion });
    }

    // Aturan 2: Mengurangi artefak pada pencahayaan kontras tinggi
    const contrast = analysisData.photometric?.contrastLevel;
    if (contrast === 'high') {
      dynamicPrompts.add("highlight yang pecah (clipped highlights)");
      dynamicPrompts.add("bayangan yang terlalu gelap (crushed blacks)");
      logger.engine.info("Aturan Negatif Dinamis: Kontras Tinggi Terdeteksi.", { contrast });
    }

    // Aturan 3: Menjaga kualitas pada Depth of Field yang dangkal
    const dof = analysisData.composition?.depthOfField;
    if (dof === 'shallow') {
      dynamicPrompts.add("blur yang tidak natural");
      dynamicPrompts.add("artefak bokeh yang aneh");
      logger.engine.info("Aturan Negatif Dinamis: DoF Dangkal Terdeteksi.", { dof });
    }
  }

  // Aturan 4: Menjaga kualitas potret jika diminta
  if (lowerUserPrompt.includes('potret') || lowerUserPrompt.includes('portrait') || lowerUserPrompt.includes('close-up')) {
    dynamicPrompts.add("tangan cacat");
    dynamicPrompts.add("jari-jari aneh");
    dynamicPrompts.add("gigi tidak rata");
    logger.engine.info("Aturan Negatif Dinamis: Konteks Potret Terdeteksi.");
  }

  // Gabungkan semua prompt negatif
  const finalPrompts = new Set<string>();

  // Tambahkan prompt statis dari pengguna
  if (staticNegativePrompt) {
    staticNegativePrompt.split(',').forEach(p => {
      const trimmed = p.trim();
      if (trimmed) finalPrompts.add(trimmed);
    });
  }

  // Tambahkan prompt dinamis yang dihasilkan
  dynamicPrompts.forEach(p => finalPrompts.add(p));

  // --- [NEW] V4.5.4 Anti-Sticker Defaults ---
  const antiStickerDefaults = [
    "sticker effect", "cutout", "pasted on", 
    "mismatched lighting", "floating subject", "bad shadow",
    "white outline", "unnatural integration", "poorly integrated"
  ];
  antiStickerDefaults.forEach(p => finalPrompts.add(p));

  const result = Array.from(finalPrompts).join(', ');
  
  if (dynamicPrompts.size > 0) {
      logger.engine.info("Prompt Negatif Dinamis Dihasilkan.", { final: result });
  }

  return result;
}