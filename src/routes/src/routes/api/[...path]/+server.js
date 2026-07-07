// routes/api/[...path]/+server.js
import { error } from '@sveltejs/kit';

// Retrieve backend credentials safely from environment variables (hidden from client)
const BASE_URL = process.env.VITE_APP_BASE_URL || 'https://api.postcom.labs.eposta.ug';
const EPOSTA_URL = process.env.VITE_APP_EPOSTA_URL || 'https://eposta-integration-api';
const SHIPPING_URL = process.env.VITE_APP_SHIPPING_URL || 'https://shipping-api';
const SHIPPING_API_KEY = process.env.SHIPPING_API_KEY || process.env.VITE_APP_API_KEY || '';
const SHIPPING_API_SECRET = process.env.SHIPPING_API_SECRET || process.env.VITE_APP_API_SECRET || '';

/**
 * Main request router that forwards requests to target microservices
 */
async function handleProxy(event) {
  const { params, request } = event;
  const path = params.path;

  // Split path to find target service segment
  const pathParts = path.split('/');
  const service = pathParts[0]; // 'main', 'eposta', 'shipping'
  const targetSubPath = pathParts.slice(1).join('/');

  let targetBaseUrl = '';
  const headers = new Headers();

  // Forward existing client headers (e.g. Content-Type, Authorization tokens)
  for (const [key, value] of request.headers.entries()) {
    // Avoid duplicating host/origin headers to prevent CORS or routing mismatches
    if (!['host', 'origin', 'referer', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Determine routing target based on endpoint prefix
  if (service === 'shipping') {
    targetBaseUrl = `${SHIPPING_URL}/api/v1/${targetSubPath}`;
    // Securely inject API keys on the server side
    headers.set('api-key', SHIPPING_API_KEY);
    headers.set('api-secret', SHIPPING_API_SECRET);
  } else if (service === 'eposta' || service === 'integration') {
    targetBaseUrl = `${EPOSTA_URL}/api/v1/${targetSubPath}`;
  } else {
    // Default to main backend API
    targetBaseUrl = `${BASE_URL}/api/v1/${path}`;
  }

  // Preserve query parameters
  const urlObj = new URL(request.url);
  if (urlObj.search) {
    targetBaseUrl += urlObj.search;
  }

  // Read request body for non-GET methods
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.arrayBuffer();
    } catch (e) {
      // Body empty or failed to parse
    }
  }

  try {
    const response = await fetch(targetBaseUrl, {
      method: request.method,
      headers,
      body,
      duplex: 'half' // Required for fetch request streaming in Node runtimes
    });

    const responseHeaders = new Headers();
    // Forward standard headers from the target response back to the client
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }

    const data = await response.arrayBuffer();

    return new Response(data, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (err) {
    console.error(`[API Proxy Error] Failed to fetch ${targetBaseUrl}:`, err);
    throw error(502, { message: 'Bad Gateway connecting to internal services.' });
  }
}

// Map standard HTTP methods to SvelteKit route handlers
export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;