// netlify/edge-functions/claid-proxy.js
// Server-side proxy for Claid.ai API to avoid CORS issues in production.
// Routes: /api/claid/image/edit/upload → https://api.claid.ai/v1/image/edit/upload
// 
// IMPORTANT: Add CLAID_API_KEY (without VITE_ prefix) to your Netlify environment variables.

export default async (request) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  // Get API key from Netlify environment (server-side only, never exposed to browser)
  const apiKey = Deno.env.get('CLAID_API_KEY');

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'CLAID_API_KEY is not configured in Netlify environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Clone request headers and set Authorization
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  // Remove host header to avoid conflicts
  headers.delete('host');

  try {
    const claidResponse = await fetch('https://api.claid.ai/v1/image/edit/upload', {
      method: 'POST',
      headers,
      body: request.body,
      // @ts-ignore — duplex is required for streaming body in Deno
      duplex: 'half',
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
      JSON.stringify({ error: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/claid/image/edit/upload' };
