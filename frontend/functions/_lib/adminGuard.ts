// What every admin route uses (ADR 0009): fail closed. No valid session cookie, no answer.
import { readSessionCookie, verifySession, type Session } from './session.ts';

export type GuardEnv = { SESSION_SECRET?: string };

export const jsonNoStore = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

/** A change must come from a page on this same site: the browser's Origin header has to match. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return !!origin && origin === new URL(request.url).origin;
}

/** The signed-in admin, or null. */
export const currentAdmin = (request: Request, env: GuardEnv): Promise<Session | null> =>
  verifySession(env.SESSION_SECRET, readSessionCookie(request));

/** Use at the top of an admin handler: `const guard = await requireAdmin(...); if (guard instanceof Response) return guard;` */
export async function requireAdmin(request: Request, env: GuardEnv, { changes = false } = {}): Promise<Session | Response> {
  if (changes && !sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  const session = await currentAdmin(request, env);
  return session ?? jsonNoStore({ error: 'Not signed in.' }, 401);
}
