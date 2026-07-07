const BACKEND_URL = process.env.PRIVATE_APP_BASE_URL || 'https://api.postcom.labs.eposta.ug';

export async function GET({ params, request }) {
  return proxyRequest(params.path, request, 'GET');
}

export async function POST({ params, request }) {
  return proxyRequest(params.path, request, 'POST');
}

export async function PUT({ params, request }) {
  return proxyRequest(params.path, request, 'PUT');
}

export async function DELETE({ params, request }) {
  return proxyRequest(params.path, request, 'DELETE');
}

export async function PATCH({ params, request }) {
  return proxyRequest(params.path, request, 'PATCH');
}

async function proxyRequest(path, request, method) {
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${url.search}`;

  const headers = new Headers();
  const skipHeaders = ['host', 'connection', 'origin', 'referer', 'cookie', 'accept-encoding'];

  for (const [key, value] of request.headers) {
    if (!skipHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const init = {
    method,
    headers,
    redirect: 'follow'
  };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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
    console.error(`[API Proxy] ${method} /api/v1/${path} failed:`, err.message);
    return new Response(JSON.stringify({ message: 'Backend service unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
