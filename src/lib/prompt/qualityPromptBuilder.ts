// src/lib/prompt/qualityPromptBuilder.ts
/**
 * Quality Prompt Builder for VHMS Reference Mode v4.1
 * - Produces quality tokens, negative prompts, and merges weighted style snippets.
 * - Strict TypeScript (no `any`), all async functions only when necessary.
 *
 * // VHMS-EDIT-REFERENCE-MODE
 */

export type QualitySettings = {
  detailLevel: "low" | "medium" | "high" | "ultra";
  realism: number; // 0..1
  clarityBoost: boolean;
  cameraTokens?: string[]; // optional extra camera tokens
};

/**
 * Build quality tokens string based on QualitySettings.
 * Idempotent: calling multiple times with same settings returns same snippet.
 */
export function buildQualityTokens(settings: QualitySettings): string {
  const parts: string[] = [];
  // detail tokens
  switch (settings.detailLevel) {
    case "low":
      parts.push("low detail");
      break;
    case "medium":
      parts.push("moderate detail");
      break;
    case "high":
      parts.push("high detail, crisp textures");
      break;
    case "ultra":
      parts.push("ultra-detailed, photorealistic, fine microdetails, studio-grade clarity");
      break;
  }

  // realism weighting
  if (settings.realism >= 0.8) parts.push("photorealistic, natural lighting, accurate anatomy");
  else if (settings.realism >= 0.5) parts.push("realistic rendering, plausible lighting");
  else parts.push("stylized rendering");

  if (settings.clarityBoost) parts.push("sharp edges, high-frequency detail, no blur");

  if (Array.isArray(settings.cameraTokens) && settings.cameraTokens.length) {
    parts.push(...settings.cameraTokens.slice(0, 4)); // limit to first N tokens
  }

  // make deterministic ordering
  return `[QUALITY:${parts.join(" | ")}]`;
}

/**
 * Build a negative prompt string to minimize common generation artifacts.
 * Keep list conservative and updateable.
 */
export function buildNegativePrompt(): string {
  const tokens = [
    "watermark",
    "low resolution",
    "blurry",
    "extra limbs",
    "mutated",
    "deformed",
    "text overlay",
    "oversaturated",
    "oversharpened",
    "jpeg artifacts",
    "unrealistic skin texture",
  ];
  return `[NEGATIVE:${tokens.join(", ")}]`;
}

/**
 * Merge weighted style embedding into a sanitized snippet.
 * - styleEmbedding: object with keys palette, lighting, lens, region_style
 * - weights: record of field weights to bias emphasis { palette: 1.0, lighting: 0.8, ... }
 *
 * This returns a compact, sanitized string suitable for injection into prompt.
 */
export function mergeWeightedStyleSnippet(
  styleEmbedding: {
    palette?: string[];
    lighting?: Record<string, unknown>;
    lens?: Record<string, unknown>;
    region_style?: Array<{ regionId?: string; weight?: number; palette?: string[] }>;
  } | null,
  weights?: { palette?: number; lighting?: number; lens?: number; region?: number }
): string {
  if (!styleEmbedding) return "";
  const w = {
    palette: weights?.palette ?? 1.0,
    lighting: weights?.lighting ?? 1.0,
    lens: weights?.lens ?? 0.8,
    region: weights?.region ?? 0.9,
  };

  const parts: string[] = [];

  if (Array.isArray(styleEmbedding.palette) && styleEmbedding.palette.length) {
    // take first up to 6 colors
    const colors = styleEmbedding.palette.slice(0, 6);
    parts.push(`Palette[weight:${w.palette.toFixed(2)}]: ${colors.join(",")}`);
  }

  if (styleEmbedding.lighting && Object.keys(styleEmbedding.lighting).length) {
    parts.push(`Lighting[weight:${w.lighting.toFixed(2)}]: ${JSON.stringify(styleEmbedding.lighting)}`);
  }

  if (styleEmbedding.lens && Object.keys(styleEmbedding.lens).length) {
    parts.push(`Lens[weight:${w.lens.toFixed(2)}]: ${JSON.stringify(styleEmbedding.lens)}`);
  }

  if (Array.isArray(styleEmbedding.region_style) && styleEmbedding.region_style.length) {
    const regionHints = styleEmbedding.region_style.slice(0, 4).map((r) => {
      const rid = r.regionId ?? "r";
      const pal = Array.isArray(r.palette) ? r.palette.slice(0, 3).join(",") : "";
      const rw = typeof r.weight === "number" ? r.weight : 1.0;
      return `${rid}[w:${(rw * w.region).toFixed(2)}]:${pal}`;
    });
    parts.push(`Regions:${regionHints.join(";")}`);
  }

  if (!parts.length) return "";
  return `[STYLE_SNIPPET:${parts.join(" | ")}]`;
}