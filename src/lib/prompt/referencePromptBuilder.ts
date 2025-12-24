
import { buildXStrictPrompt, XStrictPayload, StructuredPrompt } from "./xStrictPromptBuilder";
import type { UnifiedAnalysisData, Preservation } from "../../types";

export function buildReferencePrompt(
  userPrompt: string, 
  analysisData: UnifiedAnalysisData | null, 
  preservation: Preservation, 
  staticNegativePrompt?: string
): StructuredPrompt {
  const payload: XStrictPayload = {
    userPrompt,
    analysisData,
    preservation,
    extras: { negative: staticNegativePrompt },
    styleStrength: 0.8,
    sceneInfluence: 'influence'
  };
  // Return structured prompt object directly
  return buildXStrictPrompt(payload);
}
