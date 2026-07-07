import { json } from '@sveltejs/kit';

const BASE_URL = process.env.VITE_APP_BASE_URL || 'https://api.postcom.labs.eposta.ug';
const EPOSTA_URL = process.env.VITE_APP_EPOSTA_URL || 'https://api.postcom.labs.eposta.ug';
const SHIPPING_URL = process.env.VITE_APP_SHIPPING_URL || 'https://api.postcom.labs.eposta.ug';
const SHIPPING_API_KEY = process.env.SHIPPING_API_KEY || '';
const SHIPPING_API_SECRET = process.env.SHIPPING_API_SECRET || '';

const TIMEOUT = 2000;

async function handleProxy(event) {
  const { params, request, url } = event;
  const path = params.path;

  const pathParts = path.split('/');
  const firstSegment = pathParts[0];

  let targetUrl = '';
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    if (!['host', 'origin', 'referer', 'content-length', 'connection'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  if (firstSegment === 'shipping') {
    targetUrl = `${SHIPPING_URL}/api/v1/${pathParts.slice(1).join('/')}`;
    if (SHIPPING_API_KEY) headers.set('api-key', SHIPPING_API_KEY);
    if (SHIPPING_API_SECRET) headers.set('api-secret', SHIPPING_API_SECRET);
  } else if (firstSegment === 'eposta' || firstSegment === 'integration') {
    targetUrl = `${EPOSTA_URL}/api/v1/${pathParts.slice(1).join('/')}`;
  } else {
    targetUrl = `${BASE_URL}/api/v1/${path}`;
  }

  if (url.search) targetUrl += url.search;

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try { body = await request.arrayBuffer(); } catch (e) {}
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
      duplex: 'half'
    });

    clearTimeout(timeoutId);

    const responseHeaders = new Headers();
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
    clearTimeout(timeoutId);

    if (path.includes('products')) {
      return json([]);
    }
    if (path.includes('banners') || path.includes('pickup-centers') || path.includes('regions') || path.includes('brands')) {
      return json([]);
    }
    return json({});
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
