// Central error handling (GNR-143). A throwing handler never answers a bare 500: a signed-in admin on an admin
// route gets the real cause, everyone else a generic message, and every failure is console.error-logged for
// `wrangler tail`. The caller says whether the requester is a verified admin; this file never decides that.
export const isAdminPath = (pathname: string): boolean =>
  pathname === '/api/admin' || pathname.startsWith('/api/admin/');

// On the free plan D1 stops answering when a daily or storage allowance is used up (docs/limits.md). That is "come back
// later", not a bug, so it gets a 503 with the same wording for everyone instead of a bare 500.
const QUOTA = /(D1_ERROR|D1).*(limit|quota|exceeded)|daily .*limit|(exceeded|reached) .*limit/i;
export const isQuotaError = (error: unknown): boolean => QUOTA.test(error instanceof Error ? error.message : String(error));

export function failure(error: unknown, request: Request, verifiedAdmin = false): Response {
  const url = new URL(request.url);
  console.error(`Unhandled route error: ${request.method} ${url.pathname}`, error);

  if (isQuotaError(error)) {
    return new Response(JSON.stringify({ error: 'The site has used up its daily allowance. Please try again later.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' },
    });
  }

  const message = verifiedAdmin && isAdminPath(url.pathname)
    ? `Server error: ${error instanceof Error ? error.message : String(error)}`
    : 'Internal error.';

  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
