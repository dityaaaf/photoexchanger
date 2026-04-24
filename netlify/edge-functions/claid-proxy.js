// netlify/edge-functions/claid-proxy.js
// Proxies POST /api/claid/image/edit/upload → https://api.claid.ai/v1/image/edit/upload
// Runs on Deno (Netlify Edge Runtime). API key stored server-side only.

export default async (request) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  // Read API key from Netlify env var (set in Netlify Dashboard → Site Settings → Env Vars)
  const apiKey = Deno.env.get('CLAID_API_KEY');

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Server configuration error: CLAID_API_KEY is not set in Netlify environment variables.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }

  try {
    // Read the full body as ArrayBuffer (more reliable than streaming in Deno edge)
    const bodyBuffer = await request.arrayBuffer();

    // Get the Content-Type (must preserve multipart/form-data boundary)
    const contentType = request.headers.get('content-type') ?? '';

    const claidResponse = await fetch('https://api.claid.ai/v1/image/edit/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': contentType,
      },
      body: bodyBuffer,
    });

    const responseText = await claidResponse.text();

    return new Response(responseText, {
      status: claidResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
        message: 'Edge function failed to reach Claid API',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
};

export const config = { path: '/api/claid/image/edit/upload' };
