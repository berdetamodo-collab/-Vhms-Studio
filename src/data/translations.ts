
export const translations = {
  en: {
    // Input Panel
    inputPanelTitle: "STUDIO INPUT DECK",
    inputPanelTooltip: "Main Control Panel: Manage all visual assets and configure generation parameters.",
    sceneMode: "1. SCENE SOURCE MODE",
    modeGenerate: "From Prompt",
    modeUpload: "Background",
    modeReference: "Style Ref",
    
    // DropZones
    dropSubject: "Subject",
    dropSubjectDesc: "Face & Identity",
    dropScene: "Scene",
    dropSceneDesc: "Actual Bg",
    dropRef: "Reference",
    dropRefDesc: "Style & Light",
    dropOutfit: "Outfit",
    dropOutfitDesc: "Optional",
    dropAiScene: "AI SCENE",
    replace: "Replace",
    linkUrl: "LINK URL",
    import: "IMPORT",
    cancel: "CANCEL",
    uploadPrompt: "Click or drag",
    urlPlaceholder: "Paste Image/IG Link...",
    
    // Output Settings
    outputSettings: "5. OUTPUT SETTINGS",
    stylePreset: "VISUAL STYLE",
    resolution: "RESOLUTION",
    aspectRatio: "ASPECT RATIO",
    matchInput: "MATCH INPUT",
    styleTooltip: "Select a visual style for the generated image.",
    styleDisabled: "Style Presets are disabled in this mode. Style is fully determined by the reference image.",

    // Reference Mode Controls
    refControlsTitle: "REFERENCE MODE CONTROLS",
    shapeFidelity: "Shape Fidelity",
    shapeTooltip: "Controls how strictly the subject's original shape is kept. Higher values mean less distortion.",
    colorTransfer: "Color Transfer",
    colorTooltip: "Controls how strongly the reference image's color palette is applied. Higher values mean more vibrant color matching.",
    textureIntensity: "Texture Intensity",
    textureTooltip: "Controls how much of the reference image's grain and surface texture is applied. Higher values mean more noticeable texture.",
    
    // Advanced Settings
    advancedSettings: "6. ADVANCED SETTINGS",
    harmonization: "FINAL HARMONIZATION (REALISM+)",
    harmonizationTooltip: "When enabled, AI performs post-processing to align color bleeding, grain, and sharpness between subject and scene for photorealistic integration.",
    
    // Prompt
    promptLabel: "7. PROMPT DESCRIPTION",
    promptPlaceholderUpload: "Example: a woman smiling and waving...",
    promptPlaceholderRef: "[Optional] Add details like 'change shirt to red'. If empty, AI mimics reference style strictly.",
    promptPlaceholderGen: "Example: sitting on a sofa in a grand library at night...",
    autoDescribe: "Magic Enhance",
    
    // Negative Prompt
    negativeLabel: "8. NEGATIVE PROMPT (THINGS TO AVOID)",
    negativePlaceholder: "Example: ugly hands, blur, text, logo...",
    
    // Buttons
    resetSession: "Reset Session & Cache",
    createLock: "Create Identity Lock+",
    importBlueprint: "Import Blueprint",
    importBlueprintTooltip: "Load a previously saved .json Blueprint file to restore all its settings.",
    
    // Output Panel
    outputTitle: "OUTPUT & GENERATION",
    outputTooltip: "Your final composite image will appear here.",
    startGen: "Start Generation",
    analyzing: "Analyzing...",
    processing: "Processing...",
    result: "Generation Result",
    resultDesc: "Complete inputs and click 'Start Generation'.",
    download: "Download Image",
    editImage: "Edit Image (In-painting)",
    
    // History
    historyTitle: "HISTORY & GALLERY",
    historyTooltip: "Every image you generate is saved here.",
    restore: "Restore",
    noHistory: "No history yet.",
    noHistoryDesc: "Generated images will appear here.",
    
    // Status Messages & Estimations
    statusError: "Error Occurred",
    estTime: "Process may take a moment.",
    estTime2K: "Estimate: 20-30 seconds.",
    estTime4K: "Estimate: 60-90 seconds.",
    
    // Modals & Editors
    cropRefine: "CROP & REFINE OUTFIT",
    applyCrop: "APPLY CROP",
    saveMask: "Save Mask",
    applyChanges: "Apply Changes",
    ratio: "RATIO",
    
    // Mask Editor
    maskEditorTitle: "Interaction Mask Editor",
    maskEditorDesc: "Scroll: Zoom, Hold Alt/Ctrl: Pan",
    brushSize: "Size:",
    feather: "Feather:",
    autoMask: "Auto-Mask",
    autoMaskProcessing: "Processing...",
    
    // Inpaint Editor
    inpaintTitle: "In-Painting & Retouching Editor",
    inpaintPlaceholder: "Describe the change (e.g., 'change shirt to red')...",
    
    // Identity Lock Modal
    idLockTitle: "Create Identity Lock+ (SSEL-Lite)",
    idLockDesc: "Upload 1-5 photos of the subject's face for high-accuracy identity preservation.",
    maxImages: "Max 5 images.",
    makeLock: "Create Lock",
    
    // Style Selector
    styleGallery: "VISUAL STYLE GALLERY",
    searchStyle: "Search style (e.g. Kodak, Neon)...",
    noStyleFound: "No styles found.",
    catAll: "ALL",
    
    // Errors
    errNetwork: "Network error or server unreachable.",
    errApiKey: "Invalid or missing API Key.",
    errQuota: "API Quota exceeded.",
    errSubject: "Subject image required.",
    errScene: "Background image required.",
    errRef: "Reference image required.",
    errPrompt: "Prompt required for this mode.",
    errPromptUpload: "Prompt is required in Background Mode to describe the subject's action.",
    errUrl: "Failed to load from URL.",
    errUrlInvalid: "URL does not contain a valid image.",


    // Reference Mode Feedback Statuses
    ref_status_starting: "Initializing Engine...",
    ref_status_safety_check: "Running S.A.F.E. Protocol...",
    ref_status_preprocessing: "Enhancing Reference Image...",
    ref_status_extracting_style_cache_hit: "Loading Style Physics (Cache)...",
    ref_status_extracting_style_cache_miss: "Deconstructing Style Physics...",
    ref_status_merging_styles: "Merging Multiple Styles...",
    ref_status_building_prompt: "Building Final Prompt...",
    ref_status_generating: "Generating Image...",
    ref_status_harmonizing: "Final Harmonization...",
    ref_status_evaluating: "Evaluating Quality...",
    ref_status_retrying: "Quality below par, retrying with adjustments...",
    ref_status_verifying_physics: "Verifying Physics & Logic...",
    ref_status_enhancing_prompt: "Enhancing Prompt..."
  },
  id: {
    // Input Panel
    inputPanelTitle: "DEK INPUT STUDIO",
    inputPanelTooltip: "Panel Kontrol Utama: Kelola semua aset visual dan atur parameter generasi.",
    sceneMode: "1. MODE SUMBER SCENE",
    modeGenerate: "Dari Prompt",
    modeUpload: "Latar Belakang",
    modeReference: "Ref. Gaya",
    
    // DropZones
    dropSubject: "Subjek",
    dropSubjectDesc: "Wajah & Identitas",
    dropScene: "Latar",
    dropSceneDesc: "Scene Aktual",
    dropRef: "Referensi",
    dropRefDesc: "Gaya & Cahaya",
    dropOutfit: "Pakaian",
    dropOutfitDesc: "Opsional",
    dropAiScene: "AI SCENE",
    replace: "Ganti",
    linkUrl: "LINK URL",
    import: "IMPORT",
    cancel: "BATAL",
    uploadPrompt: "Klik atau seret",
    urlPlaceholder: "Tempel Link Gambar/IG...",
    
    // Output Settings
    outputSettings: "5. PENGATURAN OUTPUT",
    stylePreset: "GAYA VISUAL",
    resolution: "RESOLUSI",
    aspectRatio: "ASPEK RASIO",
    matchInput: "IKUTI INPUT",
    styleTooltip: "Pilih gaya visual untuk gambar yang dihasilkan.",
    styleDisabled: "Preset Gaya dinonaktifkan. Gaya ditentukan sepenuhnya oleh gambar referensi.",

    // Reference Mode Controls
    refControlsTitle: "KONTROL MODE REFERENSI",
    shapeFidelity: "Fidelitas Bentuk",
    shapeTooltip: "Mengontrol seberapa ketat bentuk asli subjek dipertahankan. Nilai lebih tinggi berarti lebih sedikit distorsi.",
    colorTransfer: "Transfer Warna",
    colorTooltip: "Mengontrol seberapa kuat palet warna gambar referensi diterapkan. Nilai lebih tinggi berarti pencocokan warna lebih kuat.",
    textureIntensity: "Intensitas Tekstur",
    textureTooltip: "Mengontrol seberapa banyak grain dan tekstur permukaan dari gambar referensi diterapkan. Nilai lebih tinggi berarti tekstur lebih jelas.",
    
    // Advanced Settings
    advancedSettings: "6. PENGATURAN LANJUTAN",
    harmonization: "HARMONISASI AKHIR (REALISME+)",
    harmonizationTooltip: "Saat diaktifkan, AI menyelaraskan color bleeding, grain, dan ketajaman antara subjek dan scene untuk integrasi fotorealistis.",
    
    // Prompt
    promptLabel: "7. DESKRIPSI PROMPT",
    promptPlaceholderUpload: "Contoh: seorang wanita tersenyum dan melambaikan tangan...",
    promptPlaceholderRef: "[Opsional] 'ubah baju jadi merah'. Jika kosong, AI meniru total gaya referensi.",
    promptPlaceholderGen: "Contoh: duduk di sofa di perpustakaan megah saat malam hari...",
    autoDescribe: "Perkaya Prompt",

    // Negative Prompt
    negativeLabel: "8. PROMPT NEGATIF (HINDARI INI)",
    negativePlaceholder: "Contoh: tangan jelek, buram, teks, logo...",
    
    // Buttons
    resetSession: "Reset Sesi & Cache",
    createLock: "Buat Kunci Identitas+",
    importBlueprint: "Impor Blueprint",
    importBlueprintTooltip: "Muat file .json Blueprint yang sudah disimpan untuk memulihkan semua pengaturannya.",
    
    // Output Panel
    outputTitle: "OUTPUT & GENERASI",
    outputTooltip: "Gambar komposit final Anda akan muncul di sini.",
    startGen: "Mulai Generasi",
    analyzing: "Menganalisis...",
    processing: "Memproses...",
    result: "Hasil Gambar",
    resultDesc: "Lengkapi input dan klik 'Mulai Generasi'.",
    download: "Unduh Gambar",
    editImage: "Edit Gambar (In-painting)",
    
    // History
    historyTitle: "RIWAYAT & GALERI",
    historyTooltip: "Setiap gambar yang Anda hasilkan disimpan di sini.",
    restore: "Pulihkan",
    noHistory: "Belum ada riwayat.",
    noHistoryDesc: "Gambar yang dihasilkan akan muncul di sini.",
    
    // Status Messages & Estimations
    statusError: "Terjadi Kesalahan",
    estTime: "Proses ini mungkin memakan waktu sejenak.",
    estTime2K: "Estimasi: 20-30 detik.",
    estTime4K: "Estimasi: 60-90 detik.",
    
    // Modals & Editors
    cropRefine: "KROP & PERBAIKI PAKAIAN",
    applyCrop: "TERAPKAN KROP",
    saveMask: "Simpan Masker",
    applyChanges: "Terapkan Perubahan",
    ratio: "RASIO",
    
    // Mask Editor
    maskEditorTitle: "Editor Masker Interaksi",
    maskEditorDesc: "Scroll: Zoom, Tahan Alt/Ctrl: Geser",
    brushSize: "Ukuran:",
    feather: "Kelembutan:",
    autoMask: "Masker-Otomatis",
    autoMaskProcessing: "Memproses...",
    
    // Inpaint Editor
    inpaintTitle: "Editor In-Painting & Retouch",
    inpaintPlaceholder: "Jelaskan perubahan yang Anda inginkan (misalnya: 'ubah kemeja menjadi merah')...",
    
    // Identity Lock Modal
    idLockTitle: "Buat Kunci Identitas+ (SSEL-Lite)",
    idLockDesc: "Unggah 1-5 foto wajah subjek untuk membuat kunci identitas yang sangat akurat.",
    maxImages: "Maksimal 5 gambar.",
    makeLock: "Buat Kunci",
    
    // Style Selector
    styleGallery: "GALERI GAYA VISUAL",
    searchStyle: "Cari gaya (misal: Kodak, Neon)...",
    noStyleFound: "Tidak ada gaya ditemukan.",
    catAll: "SEMUA",
    
    // Errors
    errNetwork: "Koneksi internet terputus atau server tidak dapat dijangkau.",
    errApiKey: "Kunci API tidak valid atau hilang.",
    errQuota: "Batas penggunaan API tercapai.",
    errSubject: "Gambar subjek diperlukan.",
    errScene: "Gambar latar belakang diperlukan.",
    errRef: "Gambar referensi diperlukan.",
    errPrompt: "Prompt diperlukan untuk mode ini.",
    errPromptUpload: "Prompt diperlukan di Mode Latar untuk mendeskripsikan aksi subjek.",
    errUrl: "Gagal memuat dari URL.",
    errUrlInvalid: "URL tidak berisi gambar yang valid.",

    // Reference Mode Feedback Statuses
    ref_status_starting: "Menginisialisasi Mesin...",
    ref_status_safety_check: "Menjalankan Protokol S.A.F.E....",
    ref_status_preprocessing: "Meningkatkan Gambar Referensi...",
    ref_status_extracting_style_cache_hit: "Memuat Fisika Gaya (Cache)...",
    ref_status_extracting_style_cache_miss: "Mendekonstruksi Fisika Gaya...",
    ref_status_merging_styles: "Menggabungkan Beberapa Gaya...",
    ref_status_building_prompt: "Membangun Prompt Final...",
    ref_status_generating: "Menghasilkan Gambar...",
    ref_status_harmonizing: "Harmonisasi Akhir...",
    ref_status_evaluating: "Mengevaluasi Kualitas...",
    ref_status_retrying: "Kualitas kurang, mencoba ulang dengan penyesuaian...",
    ref_status_verifying_physics: "Memverifikasi Fisika & Logika...",
    ref_status_enhancing_prompt: "Meningkatkan Prompt..."
  }
};