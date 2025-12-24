// tests/sanitizer/referenceSanitizer.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeStyleReferencePrompt } from '../../src/modules/prompt/sanitizer/referenceSanitizer';

describe('Sanitizer Prompt Mode Referensi', () => {
  it('harus mengganti "clone" dengan alternatif yang lebih aman', () => {
    const input = "Tolong clone subjek ke dalam scene.";
    const { sanitized, reasons, isModified } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).toContain("pertahankan proporsi non-identitas");
    expect(sanitized).not.toContain("clone");
    expect(reasons).toHaveLength(1);
    expect(isModified).toBe(true);
  });

  it('harus mengganti "tingkat piksel" dengan alternatif yang lebih aman', () => {
    const input = "Pastikan akurasi tingkat piksel.";
    const { sanitized, reasons } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).toContain("hindari replikasi piksel");
    expect(sanitized).not.toContain("tingkat piksel");
    expect(reasons.length).toBeGreaterThan(0);
  });

  it('harus mengganti "kemiripan sama persis" dengan geometri abstrak', () => {
    const input = "Jaga kemiripan sama persis dari wajah.";
    const { sanitized } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).toContain("pertahankan harmoni geometris abstrak");
    expect(sanitized).not.toContain("kemiripan sama persis");
  });

  it('harus membuat referensi "selebriti" menjadi anonim', () => {
    const input = "Buat dia terlihat seperti selebriti.";
    const { sanitized } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).toContain("subjek referensi non-spesifik");
    expect(sanitized).not.toContain("selebriti");
  });

  it('harus menangani beberapa penggantian dalam satu prompt', () => {
    const input = "Clone detail tingkat piksel dari selebriti ini.";
    const { sanitized, reasons } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).not.toContain("Clone");
    expect(sanitized).not.toContain("tingkat piksel");
    expect(sanitized).not.toContain("selebriti");
    expect(reasons.length).toBe(3);
  });

  it('harus membiarkan prompt yang aman tidak berubah', () => {
    const input = "Lukisan seekor kucing dengan gaya Van Gogh.";
    const { sanitized, reasons, isModified } = sanitizeStyleReferencePrompt(input);
    expect(sanitized).toBe(input);
    expect(reasons).toHaveLength(0);
    expect(isModified).toBe(false);
  });
});
