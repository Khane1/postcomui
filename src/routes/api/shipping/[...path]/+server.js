const SHIPPING_URL = process.env.PRIVATE_APP_SHIPPING_URL || 'https://sandbox-api.eposta.ug/third-party/api/nationality';
const API_KEY = process.env.PRIVATE_APP_API_KEY || '';
const API_SECRET = process.env.PRIVATE_APP_API_SECRET || '';

export async function GET({ params, request }) {
  return proxyShippingRequest(params.path, request, 'GET');
}

export async function POST({ params, request }) {
  return proxyShippingRequest(params.path, request, 'POST');
}

async function proxyShippingRequest(path, request, method) {
  const url = new URL(request.url);
  const targetUrl = `${SHIPPING_URL}/${path}${url.search}`;

  const headers = new Headers();
  headers.set('api-key', API_KEY);
  headers.set('api-secret', API_SECRET);
  headers.set('content-type', request.headers.get('content-type') || 'application/json');

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers.set('authorization', authHeader);
  }

  const init = { method, headers, redirect: 'follow' };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    init.signal = controller.signal;

    const response = await fetch(targetUrl, init);
    clearTimeout(timeout);

    const responseHeaders = new Headers();
    for (const [key, value] of response.headers) {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    console.error(`[Shipping Proxy] ${method} /api/shipping/${path} failed:`, err.message);
    return new Response(JSON.stringify({ message: 'Shipping service unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
