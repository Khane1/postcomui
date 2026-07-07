export function handle({ event, resolve }) {
  const response = resolve(event);

  return response.then(res => {
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
    return res;
  });
}
