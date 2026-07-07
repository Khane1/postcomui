const GOOGLE_MAPS_API_KEY = process.env.PRIVATE_GOOGLE_MAPS_API_KEY || '';

export async function GET({ url }) {
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: 'lat and lng query params required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const targetUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[Maps Proxy] Geocode request failed:', err.message);
    return new Response(JSON.stringify({ error: 'Geocoding service unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
