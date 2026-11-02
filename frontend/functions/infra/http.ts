// Small HTTP helpers shared by every handler: JSON answers, the same-origin check, reading a bounded JSON body.
export const jsonNoStore = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

/** A change must come from a page on this same site: the browser's Origin header has to match. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return !!origin && origin === new URL(request.url).origin;
}

/** The JSON body, or undefined when it is too long or not JSON. */
export async function readJson(request: Request, maxBytes: number): Promise<unknown | undefined> {
  if (Number(request.headers.get('Content-Length') ?? 0) > maxBytes) return undefined;
  const text = await request.text();
  if (text.length > maxBytes) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}

/** The numeric id in the last path segment (/api/admin/posts/12), or NaN. */
export const idOf = (request: Request): number => Number(new URL(request.url).pathname.split('/').pop());
export const validId = (id: number): boolean => Number.isInteger(id) && id >= 1;
