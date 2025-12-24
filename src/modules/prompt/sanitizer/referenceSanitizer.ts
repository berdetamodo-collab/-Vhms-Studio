// src/modules/prompt/sanitizer/referenceSanitizer.ts

export function sanitizeStyleReferencePrompt(input: string): { sanitized: string; reasons?: string[]; isModified?: boolean } {
  return { sanitized: input, reasons: [], isModified: false };
}