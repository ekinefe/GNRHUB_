// Central error handling (GNR-143). A throwing handler never answers a bare 500:
// admin routes get the real cause, public routes a generic message, and every
// failure is console.error-logged for `wrangler tail`.
export const isAdminPath = (pathname: string): boolean =>
  pathname === '/api/admin' || pathname.startsWith('/api/admin/');

export function failure(error: unknown, request: Request): Response {
  const url = new URL(request.url);
  console.error(`Unhandled route error: ${request.method} ${url.pathname}`, error);

  const message = isAdminPath(url.pathname)
    ? `Server error: ${error instanceof Error ? error.message : String(error)}`
    : 'Internal error.';

  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
