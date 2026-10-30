// Limits wrong sign-in guesses (ADR 0009). Failures are counted per client and for everyone together, in 15-minute
// windows, in the login_attempts table. The client key is an HMAC of the address, so no address is stored.
// Unlike the public-form limiters this one fails closed: if the counter cannot be read, the caller refuses to sign in.
import { type D1 } from '../../infra/d1.ts';

export const WINDOW_SECONDS = 15 * 60;
export const PER_CLIENT_LIMIT = 5;
export const GLOBAL_LIMIT = 40;
const ALL = '*';

const bucketOf = (now: number) => Math.floor(now / 1000 / WINDOW_SECONDS);

export async function clientKey(request: Request, secret: string): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`login:${ip}`)));
  return [...mac.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Seconds to wait if this client (or everyone) used up the attempts in this window, otherwise 0. */
export async function lockedFor(db: D1, client: string, now = Date.now()): Promise<number> {
  const bucket = bucketOf(now);
  const count = async (key: string) =>
    (await db.prepare('SELECT count FROM login_attempts WHERE key = ? AND bucket = ?').bind(key, bucket).first<{ count: number }>())?.count ?? 0;
  const [mine, all] = await Promise.all([count(client), count(ALL)]);
  if (mine < PER_CLIENT_LIMIT && all < GLOBAL_LIMIT) return 0;
  return WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
}

export async function recordFailure(db: D1, client: string, now = Date.now()): Promise<void> {
  const bucket = bucketOf(now);
  const bump = (key: string) =>
    db.prepare('INSERT INTO login_attempts (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1').bind(key, bucket).run();
  await Promise.all([bump(client), bump(ALL)]);
  await db.prepare('DELETE FROM login_attempts WHERE bucket < ?').bind(bucket - 3).run();
}
