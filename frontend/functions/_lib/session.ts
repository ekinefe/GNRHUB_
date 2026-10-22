// Stateless signed session for the single admin (ADR 0009). The token is `<payload>.<signature>`, both base64url:
// the payload is {sub, iat, exp}, the signature HMAC-SHA256 over the payload with SESSION_SECRET. Nothing is stored;
// changing SESSION_SECRET signs everyone out. Verifying uses crypto.subtle.verify, which compares in constant time.
export const COOKIE_NAME = 'gnr_admin';
export const SESSION_SECONDS = 8 * 60 * 60;

export type Session = { sub: string; iat: number; exp: number };

const enc = new TextEncoder();
const b64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (text: string): Uint8Array => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

const hmacKey = (secret: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);

export async function signSession(secret: string, sub: string, now = Date.now(), ttlSeconds = SESSION_SECONDS): Promise<string> {
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  const iat = Math.floor(now / 1000);
  const payload = b64(enc.encode(JSON.stringify({ sub, iat, exp: iat + ttlSeconds } satisfies Session)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), enc.encode(payload));
  return `${payload}.${b64(new Uint8Array(sig))}`;
}

export async function verifySession(secret: string | undefined, token: string | undefined, now = Date.now()): Promise<Session | null> {
  try {
    if (!secret || secret.length < 32 || !token) return null;
    const [payload, sig, extra] = token.split('.');
    if (!payload || !sig || extra !== undefined) return null;
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret, 'verify'), unb64(sig), enc.encode(payload));
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(unb64(payload))) as Session;
    if (typeof session.sub !== 'string' || typeof session.exp !== 'number' || session.exp * 1000 <= now) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export const clearSessionCookie = (): string => `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function readSessionCookie(request: Request): string | undefined {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === COOKIE_NAME) return value.join('=');
  }
  return undefined;
}
