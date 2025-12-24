
// netlify/functions/image-scraper.js
// ZERO-DEPENDENCY VERSION: No 'npm install' required.
// Uses native Node.js 'fetch' (Node 18+) and Regex for parsing.

exports.handler = async (event) => {
  const { httpMethod, queryStringParameters } = event;

  // 1. CORS Headers (Allow access from your frontend)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // 2. Handle Preflight Requests
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const targetUrl = queryStringParameters.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing "url" query parameter.' }),
    };
  }

  console.log(`[Scraper] Target URL: ${targetUrl}`);

  try {
    // 3. Fetch HTML content (Simulating a Desktop Browser to avoid mobile redirects)
    // Note: Instagram is tricky, but this works for public posts often. 
    // If IG fails, this logic still works perfectly for Unsplash, Pinterest, News sites, etc.
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }

    // Check if the URL points directly to an image
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                mimeType: contentType,
                data: base64
            }),
        };
    }

    const html = await response.text();

    // 4. Extract Image URL using Regex (Looking for Open Graph tag)
    // Regex looks for: <meta property="og:image" content="..." />
    // This is the standard way social media sites define their preview image.
    const ogImageRegex = /<meta\s+property="og:image"\s+content="([^"]+)"/i;
    const twitterImageRegex = /<meta\s+name="twitter:image"\s+content="([^"]+)"/i;
    
    let match = html.match(ogImageRegex) || html.match(twitterImageRegex);
    let imageUrl = match ? match[1] : null;

    // Special Case: Instagram logic fallback (sometimes they obfuscate tags)
    if (!imageUrl && (targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am'))) {
         // Attempt to find the first large image in JSON data if embedded (advanced regex)
         // This is a "best effort" for IG without an API
         const jsonMatch = html.match(/"display_url":"([^"]+)"/);
         if (jsonMatch) {
             imageUrl = jsonMatch[1].replace(/\\u0026/g, '&');
         }
    }

    if (!imageUrl) {
        return {
            statusCode: 422,
            headers,
            body: JSON.stringify({ error: 'No image found. The link might be private or not contain an "og:image" tag.' })
        };
    }

    // Decode HTML entities in URL (e.g. &amp; -> &)
    imageUrl = imageUrl.replace(/&amp;/g, '&');
    console.log(`[Scraper] Found Image URL: ${imageUrl}`);

    // 5. Download the actual image content
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error('Failed to download the extracted image.');
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 6. Return Base64 Data to Frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mimeType: mimeType,
        data: base64
      }),
    };

  } catch (error) {
    console.error(`[Scraper Error]`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
