// Central error handling (GNR-143). A throwing handler never answers a bare 500: a signed-in admin on an admin
// route gets the real cause, everyone else a generic message, and every failure is console.error-logged for
// `wrangler tail`. The caller says whether the requester is a verified admin; this file never decides that.
export const isAdminPath = (pathname: string): boolean =>
  pathname === '/api/admin' || pathname.startsWith('/api/admin/');

export function failure(error: unknown, request: Request, verifiedAdmin = false): Response {
  const url = new URL(request.url);
  console.error(`Unhandled route error: ${request.method} ${url.pathname}`, error);

  const message = verifiedAdmin && isAdminPath(url.pathname)
    ? `Server error: ${error instanceof Error ? error.message : String(error)}`
    : 'Internal error.';

  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
