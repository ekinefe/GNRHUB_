// What every admin route uses (ADR 0009): fail closed. No valid session cookie, no answer.
import { readSessionCookie, verifySession, type Session } from './session.ts';
import { jsonNoStore, sameOrigin } from '../infra/http.ts';

export type GuardEnv = { SESSION_SECRET?: string };

/** The signed-in admin, or null. */
export const currentAdmin = (request: Request, env: GuardEnv): Promise<Session | null> =>
  verifySession(env.SESSION_SECRET, readSessionCookie(request));

/** Use at the top of an admin handler: `const guard = await requireAdmin(...); if (guard instanceof Response) return guard;` */
export async function requireAdmin(request: Request, env: GuardEnv, { changes = false } = {}): Promise<Session | Response> {
  if (changes && !sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  const session = await currentAdmin(request, env);
  return session ?? jsonNoStore({ error: 'Not signed in.' }, 401);
}
