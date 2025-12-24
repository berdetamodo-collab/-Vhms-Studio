// src/lib/prompt/harmonizationPromptBuilder.ts (NEW)
import type { UnifiedAnalysisData } from '../../types';

/**
 * Menerjemahkan data teknis UnifiedAnalysisData menjadi prompt yang kaya dan deskriptif
 * untuk langkah harmonisasi, memastikan post-processing yang sadar konteks.
 * @param analysisData Data analisis terpadu dari gambar referensi.
 * @returns String prompt harmonisasi yang sangat spesifik.
 */
export function buildHarmonizationPrompt(analysisData: UnifiedAnalysisData): string {
  const parts: string[] = [];
  
  parts.push("// VHMS HARMONIZATION DIRECTIVE (CONTEXT-AWARE)");
  parts.push("// TASK: Perform a high-fidelity post-processing harmonization on the provided image.");
  parts.push("// GOAL: Seamlessly integrate the subject by matching the aesthetic DNA of the original scene analysis.");
  parts.push("// CONSTRAINT: DO NOT change the composition, content, or subject's identity. Only enhance and harmonize the final pixels.");

  parts.push("\n[AESTHETIC DNA]");
  
  // 1. Photometric (Lighting & Color)
  if (analysisData.photometric && analysisData.color) {
    parts.push(`- **LIGHTING & COLOR GRADE:** Re-grade the image to match a '${analysisData.photometric.globalMood}' mood with a '${analysisData.color.temperature}' color temperature. The key light is '${analysisData.photometric.keyLight.quality}' and originates from the '${analysisData.photometric.keyLight.direction}'. Shadows should be '${analysisData.photometric.shadowQuality}' with '${analysisData.photometric.contrastLevel}' contrast.`);
  }

  // 2. Noise & Texture (Sensor)
  if (analysisData.noiseAnalysis) {
    const { grainType, intensity, structureDescription } = analysisData.noiseAnalysis;
    let grainInstruction = `Simulate a '${grainType}' sensor noise profile.`;
    if (grainType.toLowerCase().includes('film')) {
      grainInstruction = `Apply a realistic film grain simulation matching '${structureDescription}'.`;
    }
    parts.push(`- **SENSOR & TEXTURE:** ${grainInstruction} The grain intensity should be '${intensity}'.`);
  }

  // 3. Optics (Lens)
  // FIX: Menggunakan lensDistortion karena cameraShot tidak ada dalam UnifiedAnalysisData.
  if (analysisData.lensDistortion && analysisData.composition) {
    const { distortionType } = analysisData.lensDistortion;
    const { depthOfField } = analysisData.composition;
    parts.push(`- **OPTICAL PROPERTIES:** Introduce subtle optical effects consistent with a '${distortionType}' lens profile, such as faint chromatic aberration on high-contrast edges. Ensure the depth of field remains '${depthOfField}'.`);
  }
  
  // 4. Atmosphere
  if (analysisData.atmosphere) {
      parts.push(`- **OVERALL ATMOSPHERE:** The final image must evoke a '${analysisData.atmosphere.genre}' feel, consistent with a scene captured during '${analysisData.atmosphere.timeOfDay}' in '${analysisData.atmosphere.weather}' weather.`);
  }

  parts.push("\n[EXECUTE]");
  parts.push("Apply these harmonization effects to the entire image for a cohesive final render.");

  return parts.join("\n");
}