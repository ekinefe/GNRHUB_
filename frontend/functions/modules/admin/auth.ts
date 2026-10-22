// Admin sign-in routes (ADR 0009): POST /api/admin/login, POST /api/admin/logout, GET /api/admin/me.
// One account. ADMIN_USERNAME and ADMIN_PASSWORD_HASH are Worker secrets, SESSION_SECRET signs the cookie.
import { hashPassword, verifyPassword } from '../../_lib/password.ts';
import { signSession, sessionCookie, clearSessionCookie } from '../../_lib/session.ts';
import { safeEqual } from '../../_lib/safeEqual.ts';
import { jsonNoStore, sameOrigin, currentAdmin } from '../../_lib/adminGuard.ts';
import { clientKey, lockedFor, recordFailure } from '../../_lib/loginLimit.ts';

type D1 = Parameters<typeof lockedFor>[0];
export type AuthEnv = { DB?: unknown; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; SESSION_SECRET?: string };
type Context = { request: Request; env: AuthEnv };

const MAX_BODY = 2048;
const MAX_FIELD = 200;

// A real hash to check against when the username is wrong, so a wrong username takes as long as a wrong password.
let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= hashPassword('not the password'));

async function readCredentials(request: Request): Promise<{ username: string; password: string } | null> {
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    const body = JSON.parse(text);
    if (typeof body?.username !== 'string' || typeof body?.password !== 'string') return null;
    if (body.username.length > MAX_FIELD || body.password.length > MAX_FIELD) return null;
    return { username: body.username, password: body.password };
  } catch {
    return null;
  }
}

async function login({ request, env }: Context): Promise<Response> {
  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET, DB } = env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SESSION_SECRET || SESSION_SECRET.length < 32 || !DB) {
    return jsonNoStore({ error: 'Admin sign-in is not available.' }, 503);
  }
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);

  const db = DB as D1;
  const client = await clientKey(request, SESSION_SECRET);
  const wait = await lockedFor(db, client);
  if (wait > 0) return jsonNoStore({ error: 'Too many attempts. Try again later.' }, 429, { 'Retry-After': String(wait) });

  const credentials = await readCredentials(request);
  const userOk = credentials ? await safeEqual(credentials.username, ADMIN_USERNAME) : false;
  const passOk = await verifyPassword(credentials?.password ?? '', userOk ? ADMIN_PASSWORD_HASH : await dummyHash());

  if (!credentials || !userOk || !passOk) {
    await recordFailure(db, client);
    return jsonNoStore({ error: 'Wrong username or password.' }, 401);
  }

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
  return jsonNoStore(session ? { ok: true, user: session.sub } : { ok: false });
}

export const loginRoute = { onRequestPost: login };
export const logoutRoute = { onRequestPost: logout };
export const meRoute = { onRequestGet: me };
