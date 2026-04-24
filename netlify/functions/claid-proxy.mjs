// netlify/functions/claid-proxy.mjs
// Regular Netlify Function (Node.js) — more reliable env var access than Edge Functions
// Routes: POST /api/claid/image/edit/upload → https://api.claid.ai/v1/image/edit/upload
//
// Required Netlify environment variable: CLAID_API_KEY (without VITE_ prefix)

export default async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Read API key from Node.js process.env (set in Netlify Dashboard → Environment Variables)
  const apiKey = process.env.CLAID_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server error: CLAID_API_KEY is not set in Netlify environment variables.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const contentType = req.headers.get('content-type') ?? '';
    const body = await req.arrayBuffer();

    const claidResponse = await fetch('https://api.claid.ai/v1/image/edit/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': contentType,
      },
      body,
    });

    const responseText = await claidResponse.text();

    return new Response(responseText, {
      status: claidResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err), message: 'Failed to reach Claid API' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Netlify Functions v2: declare route path directly in the function
export const config = { path: '/api/claid/image/edit/upload' };
