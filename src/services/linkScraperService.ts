/**
 * Universal Link Scraper Service
 * Uses a multi-strategy approach to fetch images from URLs client-side,
 * leveraging public CORS proxies.
 */

const extractImageFromHtml = (html: string): string | null => {
    const metaTargets = ['og:image', 'og:image:secure_url', 'twitter:image', 'twitter:image:src', 'image', 'thumbnail'];
    for (const target of metaTargets) {
        const regex = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${target}["'][^>]+content=["']([^"']+)["']`, 'i');
        const match = html.match(regex);
        if (match && match[1]) return match[1];
    }
    const jsonLdMatch = html.match(/"image":\s*\[?\s*"([^"]+)"/i);
    if (jsonLdMatch && jsonLdMatch[1]) return jsonLdMatch[1];
    return null;
};

export const processUniversalLink = async (targetUrl: string): Promise<Blob> => {
    console.log(`[LinkScraper] Processing: ${targetUrl}`);

    // Strategy 1: Instagram Direct Media Endpoint
    if (targetUrl.includes('instagram.com')) {
        try {
            console.log("[LinkScraper] Instagram link detected. Trying Direct Media strategy...");
            const match = targetUrl.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                const magicUrl = `https://www.instagram.com/p/${match[1]}/media/?size=l`;
                const imageProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(magicUrl)}&output=jpg`;
                const imageResponse = await fetch(imageProxyUrl);
                if (!imageResponse.ok) throw new Error("Failed to fetch Instagram media.");
                const blob = await imageResponse.blob();
                if (blob.size < 3000) throw new Error("Image too small (likely an error icon).");
                return blob;
            }
        } catch (igError) {
            console.warn("[LinkScraper] Instagram Direct Media failed, falling back...", igError);
        }
    }

    // Strategy 2: Direct Image Proxy (Optimistic)
    try {
        console.log("[LinkScraper] Trying Direct Image Proxy strategy...");
        const directProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}&output=jpg`;
        const directResponse = await fetch(directProxyUrl);
        if (directResponse.ok) {
            const blob = await directResponse.blob();
            if (blob.type.startsWith('image/') && blob.size > 500) {
                console.log("[LinkScraper] Success! URL was a direct image link.");
                return blob;
            }
        }
    } catch {
        console.log("[LinkScraper] Not a direct image link. Falling back to HTML scraping.");
    }

    // Strategy 3: General HTML Scraping (AllOrigins Proxy)
    console.log("[LinkScraper] Executing HTML Scraping strategy via AllOrigins...");
    const proxyHtmlUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    try {
        const response = await fetch(proxyHtmlUrl);
        if (!response.ok) throw new Error("Failed to fetch page data via proxy.");
        const data = await response.json();
        const html = data.contents;
        if (!html) throw new Error("Page content is empty.");

        let imageUrl = extractImageFromHtml(html);
        if (!imageUrl) throw new Error("Could not find a primary image (og:image) on the page.");
        
        imageUrl = imageUrl.replace(/&amp;/g, '&');
        if (imageUrl.includes("instagram_logo")) throw new Error("Scraping failed: Blocked by login page.");

        console.log(`[LinkScraper] Found image URL in HTML: ${imageUrl}`);
        const imageProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&output=jpg`;
        const imageResponse = await fetch(imageProxyUrl);
        if (!imageResponse.ok) throw new Error("Failed to download final image file.");
        return await imageResponse.blob();

    } catch (error) {
        console.error("[LinkScraper] Final strategy failed:", error);
        throw error;
    }
};
