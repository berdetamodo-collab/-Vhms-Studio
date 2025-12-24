
import { AppStatus } from '../types';

/**
 * Service untuk mensimulasikan alur kerja VHMS
 * Digunakan untuk pengujian UI Log dan Validasi State.
 */
export const diagnosticService = {
    runSimulatedTest: async (
        mode: string, 
        appendLog: (msg: string, type?: any) => void,
        onProgress: (status: AppStatus, msg: string) => void
    ) => {
        appendLog(`[DIAGNOSTIC] Memulai simulasi mode: ${mode.toUpperCase()}`, 'system');
        
        onProgress('INITIALIZING', 'Inisialisasi Sandbox...');
        await new Promise(r => setTimeout(r, 800));

        appendLog(`[DIAGNOSTIC] Memeriksa API Key: ${process.env.API_KEY ? 'TERDETEKSI' : 'HILANG'}`, 'success');
        
        onProgress('ANALYZING_PRIMARY', 'Simulasi OMNI-SCAN (Gemini 3 Pro)...');
        await new Promise(r => setTimeout(r, 1200));
        appendLog(`[SIM] ODC: Barrel distortion (Int: 0.12) detected`, 'ai');
        appendLog(`[SIM] STMS: Warm undertone calibrated`, 'ai');
        appendLog(`[SIM] FBT: Bounding Box locked at 0.35, 0.22`, 'ai');
        
        onProgress('BUILDING_PROMPT', 'Simulasi Konstruksi Blueprint...');
        await new Promise(r => setTimeout(r, 1000));
        appendLog(`[SIM] Prompt Directive Construct: SUCCESS`, 'success');

        onProgress('GENERATING_IMAGE', 'Simulasi Render (Gemini 2.5 Flash Image)...');
        await new Promise(r => setTimeout(r, 1500));
        
        onProgress('HARMONIZING', 'Simulasi Penyelarasan Cahaya...');
        await new Promise(r => setTimeout(r, 800));

        onProgress('DONE', 'Simulasi Selesai. Alur Logika v12.21 Valid.');
        appendLog(`[DIAGNOSTIC] Semua jalur komunikasi API stabil.`, 'success');
    }
};
