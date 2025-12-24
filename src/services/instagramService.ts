
/**
 * Service untuk menangani pengunduhan gambar dari link Instagram
 * menggunakan API Wataru (Scraper/Extractor).
 */

// Endpoint API Publik Wataru milik User
const WATARU_API_ENDPOINT = 'https://dev.oculux.xyz/api/instadl';

export const isInstagramUrl = (url: string): boolean => {
    return url.includes('instagram.com') || url.includes('instagr.am');
};

/**
 * Memproses link Instagram melalui API Wataru.
 * Flow: 
 * 1. Kirim Link IG ke API Wataru -> Dapat JSON response berisi URL CDN.
 * 2. Fetch URL CDN tersebut -> Ubah jadi Blob.
 */
export const processInstagramLink = async (instagramUrl: string): Promise<Blob> => {
    let response;
    
    // 1. Panggil API Wataru (Extractor)
    const targetApiUrl = `${WATARU_API_ENDPOINT}?url=${encodeURIComponent(instagramUrl)}`;
    console.log(`[InstagramService] Menghubungi API Extractor: ${targetApiUrl}`);

    try {
        response = await fetch(targetApiUrl);
    } catch (networkError) {
        // Ini menangkap error jika server MATI total (DNS fail, Connection Refused) atau CORS memblokir preflight.
        console.error("[InstagramService] Network Error:", networkError);
        throw new Error("Gagal terhubung ke API Server (Network Error). API mungkin mati atau memblokir akses browser (CORS).");
    }

    // 2. Cek Status HTTP (404, 500, dll)
    if (!response.ok) {
        throw new Error(`API Server merespon dengan Error: ${response.status} ${response.statusText}`);
    }

    // 3. Cek apakah responnya valid JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[InstagramService] Respon bukan JSON:", text.substring(0, 200));
        throw new Error("API Server aktif, tapi mengembalikan data HTML/Text (bukan JSON). Kemungkinan endpoint salah atau sedang maintenance.");
    }

    // 4. Parsing JSON
    let data;
    try {
        data = await response.json();
        console.log("[InstagramService] Respon API Raw:", data);
    } catch (jsonError) {
        throw new Error("Gagal membaca JSON dari API Server.");
    }

    // 5. Ekstraksi URL Gambar dari Struktur Wataru
    // Struktur umum Wataru: { status: true, result: [ { url: "...", ... } ] } atau { result: { url: "..." } }
    let directImageUrl: string | null = null;

    if (data.result) {
        if (Array.isArray(data.result)) {
            // Cari item pertama yang memiliki URL dan sepertinya adalah gambar
            const imageItem = data.result.find((item: any) => item.url && (!item.type || item.type === 'image'));
            if (imageItem) directImageUrl = imageItem.url;
            // Fallback: ambil elemen pertama jika tidak ada filter tipe
            else if (data.result.length > 0) directImageUrl = data.result[0].url;
        } else if (typeof data.result === 'object' && data.result.url) {
            directImageUrl = data.result.url;
        }
    } else if (data.url) {
        // Fallback struktur flat
        directImageUrl = data.url;
    }

    if (!directImageUrl) {
        console.error("[InstagramService] Struktur JSON tidak dikenali:", data);
        throw new Error("API aktif, tapi tidak ada URL gambar ditemukan dalam respon. Cek log console untuk struktur JSON.");
    }

    console.log(`[InstagramService] URL Gambar CDN ditemukan: ${directImageUrl}`);

    // 6. Fetch Gambar dari CDN (Handle CORS)
    // Kita mencoba fetch langsung dulu.
    try {
        const imageResponse = await fetch(directImageUrl);
        if (!imageResponse.ok) throw new Error("Gagal mengunduh gambar dari CDN.");
        return await imageResponse.blob();
    } catch (corsError) {
        console.warn("[InstagramService] Fetch langsung gagal (kemungkinan CORS). Mencoba via Proxy Image...", corsError);
        
        // Fallback: Gunakan layanan proxy gambar publik (wsrv.nl) untuk mem-bypass CORS CDN Instagram
        // Ini aman untuk client-side fetching.
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(directImageUrl)}&output=jpg`;
        try {
            const proxyResponse = await fetch(proxyUrl);
            if (!proxyResponse.ok) {
                throw new Error(`Proxy Image gagal: ${proxyResponse.status}`);
            }
            return await proxyResponse.blob();
        } catch (proxyErr) {
             throw new Error("Gagal mengunduh gambar final (CDN & Proxy Blocked).");
        }
    }
};
