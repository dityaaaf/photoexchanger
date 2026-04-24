// src/lib/claid.ts
// Claid.ai Image Editing API
// Upload endpoint proxied via Vite dev server (vite.config.ts) to avoid CORS.
// /api/claid/image/edit/upload → https://api.claid.ai/v1/image/edit/upload
// Docs: https://docs.claid.ai/image-editing-api/upload-api-reference

const CLAID_API_URL = '/api/claid/image/edit/upload';

export interface ClaidResizeOptions {
  width?: number | string;
  height?: number | string;
  fit?: string | { type: string; [key: string]: any };
}

export interface ClaidRestorationOptions {
  upscale?: string;
  decompress?: string;
  polish?: boolean;
}

export interface ClaidOperations {
  resizing?: ClaidResizeOptions;
  restorations?: ClaidRestorationOptions;
  adjustments?: {
    hdr?: number;
    exposure?: number;
    saturation?: number;
    contrast?: number;
    sharpness?: number;
  };
}

/**
 * Sends an image File/Blob to Claid.ai using the Upload API (multipart/form-data).
 * Returns the tmp_url of the processed image.
 *
 * Endpoint: POST https://api.claid.ai/v1/image/edit/upload
 */
export async function processImageWithClaid(
  imageFile: Blob,
  operations: ClaidOperations
): Promise<string> {
  const API_KEY = import.meta.env.VITE_CLAID_API_KEY || '';

  // Build multipart/form-data payload
  const formData = new FormData();

  // 'file' part — the raw image binary
  formData.append('file', imageFile, 'image.jpg');

  // 'data' part — must be a plain JSON STRING, not a Blob
  // Claid API validates this field as "str type expected"
  const dataPayload = JSON.stringify({ operations });
  formData.append('data', dataPayload);

  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  try {
    const response = await fetch(CLAID_API_URL, {
      method: 'POST',
      headers,
      // NOTE: Do NOT set Content-Type manually — browser will set multipart/form-data
      //       with the correct boundary automatically when using FormData.
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(
        `Claid API Error [${response.status}]: ${errorData?.message || JSON.stringify(errorData)}`
      );
    }

    const json = await response.json();

    // Response structure: { data: { output: { tmp_url: "..." } } }
    const tmpUrl: string | undefined = json?.data?.output?.tmp_url;

    if (!tmpUrl) {
      console.error('Unexpected Claid API response:', json);
      throw new Error('Claid API: Missing output tmp_url in response.');
    }

    return tmpUrl;

  } catch (error) {
    console.error('Claid API call failed:', error);
    throw error;
  }
}
