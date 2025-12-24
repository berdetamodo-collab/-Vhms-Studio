
/* [INTEGRITY CHECK]
MD5={{GENERATED_CHECKSUM}}
DO NOT MODIFY, REMOVE, OR REINTERPRET ANY SECTION MARKED X-STRICT.
FAILURE TO MAINTAIN INTEGRITY INVALIDATES THE DIRECTIVE.
*/

export interface XStrictPayload {
  userPrompt: string;
  analysisData?: any;
  preservation?: { shape:number; color:number; texture:number };
  extras?: Record<string,any>;
  styleStrength?: number;
  sceneInfluence?: 'none' | 'influence' | 'strict';
}

export interface StructuredPrompt {
  pre: string;
  post: string;
}

export function buildXStrictPrompt(p: XStrictPayload): StructuredPrompt {
  // Logic kondisional cerdas untuk Aturan #5
  const hasUserPrompt = p.userPrompt && p.userPrompt.trim().length > 1;

  const ruleFive = hasUserPrompt
    ? `5. **COMPOSITION RULE:** The layout/scene must follow the User Text: "${p.userPrompt}". [IMAGE 2] is for COLOR/GRAIN only.`
    : `5. **COMPOSITION RULE:** Since no text prompt was provided, detect the *Location Type* of [IMAGE 2] (e.g. 'Cafe', 'Park'). Then, generate a **COMPLETELY NEW** version of that location. DO NOT COPY the room layout.`;

  // TEXT BLOCK (BEFORE IMAGES)
  const preImageText = `
// VHMS PROTOCOL: THE_SHREDDER_V10
// MODE: ANTI_DERIVATIVE_SYNTHESIS

// --- INPUT DEFINITIONS ---

// [IMAGE 1]: "IDENTITY_BLUEPRINT"
// - Contains: The Face and Head structure.
// - Action: EXTRACT identity. Apply to a NEWLY GENERATED BODY.

// [IMAGE 2]: "STYLE_REF_TEXTURE_MAP"
// - Contains: Color Palette, ISO Grain, White Balance, Lighting Defects.
// - Action: COPY the "Vibe".
// - ⛔ WARNING: DO NOT COPY THE PIXELS. DO NOT COPY THE COMPOSITION.

// --- ⚠️ CRITICAL PROHIBITIONS (FATAL ERRORS) ---
1. **NO HEAD SWAPS:** Do NOT paste the face from [1] onto the body in [IMAGE 2].
2. **NO BODY THEFT:** The body/clothes in [IMAGE 2] are "RADIOACTIVE". Touching them is forbidden. You MUST generate a new body/outfit for the subject.
3. **NO BEAUTIFICATION:** Do NOT apply "Cinematic", "Teal & Orange", or "HDR" filters unless explicitly asked.
   - If [IMAGE 2] looks like a cheap phone photo, the output MUST look like a cheap phone photo.
   - Match the contrast curve of [IMAGE 2] exactly. Do not "fix" it.

${ruleFive}

// --- GENERATION STEPS ---
1. Analyze [IMAGE 2]. Throw away the geometry. Keep only the Colors and Lighting.
2. Construct a NEW 3D SCENE based on the location type.
3. Place a NEW 3D BODY in that scene.
4. Apply the face from [IMAGE 1] to that new body.
5. Render the final image using the exact color grading of [IMAGE 2].
`.trim();

  // TEXT BLOCK (AFTER IMAGES)
  const postImageText = `
// FINAL CHECKLIST BEFORE RENDER:
- Did I accidently copy the background from Image 2? -> If YES, RESET and make a new background.
- Did I accidently copy the body/clothes from Image 2? -> If YES, RESET and make new clothes.
- Did I apply a "Cinematic" filter? -> If YES, REMOVE IT. Use the raw colors from Image 2.

EXECUTE GENERATION.
`.trim();

  return {
    pre: preImageText,
    post: postImageText
  };
}
