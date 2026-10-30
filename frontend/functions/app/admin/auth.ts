// Admin sign-in routes (ADR 0009): POST /api/admin/login, POST /api/admin/logout, GET /api/admin/me.
// One account. ADMIN_USERNAME and ADMIN_PASSWORD_HASH are Worker secrets, SESSION_SECRET signs the cookie.
import { checkSignIn } from '../../domain/admin/signin.ts';
import { clientKey } from '../../domain/admin/loginLimit.ts';
import { signSession, sessionCookie, clearSessionCookie } from '../../domain/admin/session.ts';
import { dbOf } from '../../infra/d1.ts';
import { jsonNoStore, readJson, sameOrigin } from '../../infra/http.ts';
import { currentAdmin } from './guard.ts';

export type AuthEnv = { DB?: unknown; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; SESSION_SECRET?: string; ADMIN_TOTP_SECRET?: string };
type Context = { request: Request; env: AuthEnv };

const MAX_BODY = 2048;
const MAX_FIELD = 200;

async function readCredentials(request: Request): Promise<{ username: string; password: string; code: string } | null> {
  const body = (await readJson(request, MAX_BODY)) as { username?: unknown; password?: unknown; code?: unknown } | undefined | null;
  if (typeof body?.username !== 'string' || typeof body?.password !== 'string') return null;
  if (body.username.length > MAX_FIELD || body.password.length > MAX_FIELD) return null;
  const code = typeof body.code === 'string' && body.code.length <= 20 ? body.code : '';
  return { username: body.username, password: body.password, code };
}

async function login({ request, env }: Context): Promise<Response> {
  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET, ADMIN_TOTP_SECRET } = env;
  const db = dbOf(env);
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SESSION_SECRET || SESSION_SECRET.length < 32 || !db) {
    return jsonNoStore({ error: 'Admin sign-in is not available.' }, 503);
  }
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);

  const client = await clientKey(request, SESSION_SECRET);
  const credentials = await readCredentials(request);
  const result = await checkSignIn(db, { username: ADMIN_USERNAME, passwordHash: ADMIN_PASSWORD_HASH, totpSecret: ADMIN_TOTP_SECRET }, credentials, client);

  if (!result.ok && result.reason === 'locked') return jsonNoStore({ error: 'Too many attempts. Try again later.' }, 429, { 'Retry-After': String(result.wait) });
  if (!result.ok) return jsonNoStore({ error: ADMIN_TOTP_SECRET ? 'Wrong username, password or code.' : 'Wrong username or password.' }, 401);

  const token = await signSession(SESSION_SECRET, 'owner');
  const response = jsonNoStore({ ok: true });
  response.headers.append('Set-Cookie', sessionCookie(token));
  return response;
}

async function logout({ request }: Context): Promise<Response> {
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  const response = jsonNoStore({ ok: true });
  response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}

async function me({ request, env }: Context): Promise<Response> {
  const session = await currentAdmin(request, env);
  // Answers 200 either way: "not signed in" is a normal answer here, not an error, so the page that asks does not
  // fill the browser console with a failed request every time a visitor-less admin page loads.
  return jsonNoStore(session ? { ok: true, user: session.sub } : { ok: false, needsCode: !!env.ADMIN_TOTP_SECRET });
}

export const loginRoute = { onRequestPost: login };
export const logoutRoute = { onRequestPost: logout };
export const meRoute = { onRequestGet: me };
