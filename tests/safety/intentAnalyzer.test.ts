// tests/safety/intentAnalyzer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleGenAI } from "@google/genai";
import { analyzeSafetyIntent } from '../../src/cognitive/intentAnalyzer';

// Mock modul @google/genai secara keseluruhan
vi.mock('@google/genai');

describe('Intent Analyzer - S.A.F.E. Protocol', () => {

  const mockGenerateContent = vi.fn();

  beforeEach(() => {
    // Reset semua mock sebelum setiap pengujian
    vi.clearAllMocks();
    
    // Konfigurasi implementasi mock untuk GoogleGenAI
    // Ini memastikan bahwa setiap kali `new GoogleGenAI()` dipanggil di dalam `intentAnalyzer`,
    // ia akan mengembalikan objek dengan metode `generateContent` yang sudah di-mock.
    (GoogleGenAI as any).mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });
  });

  const dummyPrompt = "seorang wanita tersenyum";
  const dummyImage = new Blob([''], { type: 'image/jpeg' });

  it('harus mengembalikan "low risk" untuk niat adaptasi gaya yang jelas', async () => {
    // Atur mock untuk mengembalikan respons risiko rendah
    const mockApiResponse = {
      text: JSON.stringify({
        riskLevel: 'low',
        detectedIntent: 'style_adaptation',
        reasoning: 'Prompt tidak meminta peniruan dan fokus pada gaya.'
      })
    };
    mockGenerateContent.mockResolvedValue(mockApiResponse);

    const result = await analyzeSafetyIntent("gunakan pencahayaan sinematik ini", dummyImage);

    // Verifikasi hasil
    expect(result.riskLevel).toBe('low');
    expect(result.detectedIntent).toBe('style_adaptation');
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('harus mengembalikan "high risk" untuk niat peniruan literal yang terdeteksi', async () => {
    // Atur mock untuk mengembalikan respons risiko tinggi
    const mockApiResponse = {
      text: JSON.stringify({
        riskLevel: 'high',
        detectedIntent: 'literal_replication',
        reasoning: 'Prompt meminta untuk membuat ulang orang dari referensi.'
      })
    };
    mockGenerateContent.mockResolvedValue(mockApiResponse);

    const result = await analyzeSafetyIntent("buat ulang wajah dari gambar ini", dummyImage);

    // Verifikasi hasil
    expect(result.riskLevel).toBe('high');
    expect(result.detectedIntent).toBe('literal_replication');
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('harus melakukan fallback ke "high risk" jika terjadi kegagalan API', async () => {
    // Atur mock untuk melempar error
    const apiError = new Error("Quota exceeded");
    mockGenerateContent.mockRejectedValue(apiError);

    const result = await analyzeSafetyIntent(dummyPrompt, dummyImage);

    // Verifikasi bahwa sistem aman secara default
    expect(result.riskLevel).toBe('high');
    expect(result.detectedIntent).toBe('unclear');
    expect(result.reasoning).toContain('Analisis keamanan internal gagal');
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('harus mengembalikan "high risk" jika respons API tidak valid atau kosong', async () => {
    // Atur mock untuk mengembalikan respons yang tidak valid
    const mockApiResponse = { text: "" }; // Respons kosong
    mockGenerateContent.mockResolvedValue(mockApiResponse);

    const result = await analyzeSafetyIntent(dummyPrompt, dummyImage);

    // Verifikasi fallback
    expect(result.riskLevel).toBe('high');
    expect(result.detectedIntent).toBe('unclear');
  });
});
