import { json } from '@sveltejs/kit';

export function GET() {
  const key = process.env.PRIVATE_GOOGLE_MAPS_API_KEY || '';
  return json({ key });
}
