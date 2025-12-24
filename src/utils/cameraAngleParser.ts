import type { CameraAngle } from '../types';

type AngleKeywordMap = {
  keywords: string[];
  pitch: number | null;
  yaw: number | null;
};

// Daftar kata kunci dan mappingnya ke koordinat pitch/yaw
const angleMappings: AngleKeywordMap[] = [
  // Vertical Angles
  { keywords: ["bird's eye view", "overhead shot", "top-down shot"], pitch: 1.0, yaw: null },
  { keywords: ["high angle", "from above", "shot from above"], pitch: 0.75, yaw: null },
  { keywords: ["slightly high angle"], pitch: 0.3, yaw: null },
  { keywords: ["eye-level", "eye level", "straight-on"], pitch: 0.0, yaw: null },
  { keywords: ["low angle", "from below", "shot from below"], pitch: -0.7, yaw: null },
  { keywords: ["slightly low angle"], pitch: -0.3, yaw: null },
  { keywords: ["worm's eye view", "extreme low angle"], pitch: -1.0, yaw: null },
  { keywords: ["dutch angle", "dutch tilt", "canted angle"], pitch: 0.1, yaw: null }, // Dutch angle has a slight pitch bias but is mostly composition
  
  // Horizontal Angles
  { keywords: ["front view", "front-facing", "head-on shot"], pitch: null, yaw: 0.0 },
  { keywords: ["from the left", "left side view"], pitch: null, yaw: -0.75 },
  { keywords: ["from the right", "right side view"], pitch: null, yaw: 0.75 },
  { keywords: ["left profile", "profile from left"], pitch: null, yaw: -1.0 },
  { keywords: ["right profile", "profile from right"], pitch: null, yaw: 1.0 },
  { keywords: ["3/4 view", "three quarter view"], pitch: null, yaw: 0.4 }, // Default to right 3/4
  { keywords: ["left 3/4 view", "left three quarter"], pitch: null, yaw: -0.4 },
  { keywords: ["right 3/4 view", "right three quarter"], pitch: null, yaw: 0.4 },
  { keywords: ["from behind", "shot from the back", "rear view"], pitch: null, yaw: 1.0 }, // Using yaw=1.0 for 'behind' as a convention
];

// Gabungkan semua keyword menjadi satu array untuk penghapusan
const allKeywords = angleMappings.flatMap(m => m.keywords);
const keywordRegex = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'gi');

/**
 * Menganalisis string prompt dan mengekstrak sudut kamera yang terdeteksi.
 * Mengembalikan pitch dan yaw yang terdeteksi, atau null jika tidak ada.
 */
export function parseAngleFromPrompt(prompt: string): Partial<CameraAngle> | null {
  const lowerPrompt = prompt.toLowerCase();
  let detectedPitch: number | null = null;
  let detectedYaw: number | null = null;
  let found = false;

  for (const mapping of angleMappings) {
    for (const keyword of mapping.keywords) {
      if (lowerPrompt.includes(keyword)) {
        found = true;
        if (mapping.pitch !== null) {
          detectedPitch = mapping.pitch;
        }
        if (mapping.yaw !== null) {
          detectedYaw = mapping.yaw;
        }
      }
    }
  }

  if (!found) {
    return null;
  }

  return { pitch: detectedPitch, yaw: detectedYaw };
}

/**
 * Menghapus semua kata kunci yang berhubungan dengan sudut kamera dari string prompt.
 */
export function stripAngleKeywords(prompt: string): string {
  // Regex ini mengganti kata kunci yang ditemukan (dengan batas kata \b) dengan string kosong.
  // trim() di akhir membersihkan spasi ganda yang mungkin muncul.
  return prompt.replace(keywordRegex, '').replace(/\s\s+/g, ' ').trim();
}