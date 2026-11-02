// Limits how many messages one client (and everyone together) can send through the contact form, per hour, in
// contact_hits. The client key is an HMAC of the address, so no address is stored. Fails closed: if the counter cannot
// be read or written the form answers 503, because an unlimited form is a spam hole.
import { type D1 } from '../../infra/d1.ts';

export const WINDOW_SECONDS = 60 * 60;
export const PER_CLIENT_LIMIT = 3;
export const GLOBAL_LIMIT = 30;
const ALL = '*';

const bucketOf = (now: number) => Math.floor(now / 1000 / WINDOW_SECONDS);

export async function contactClientKey(request: Request, secret = 'gnrdigital-contact'): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`contact:${ip}`)));
  return [...mac.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Seconds to wait when this client (or everyone) has used the hour's allowance, otherwise 0. */
export async function contactLockedFor(db: D1, client: string, now = Date.now()): Promise<number> {
  const bucket = bucketOf(now);
  const count = async (key: string) =>
    (await db.prepare('SELECT count FROM contact_hits WHERE key = ? AND bucket = ?').bind(key, bucket).first<{ count: number }>())?.count ?? 0;
  const [mine, all] = await Promise.all([count(client), count(ALL)]);
  if (mine < PER_CLIENT_LIMIT && all < GLOBAL_LIMIT) return 0;
  return WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
}

export async function contactRecord(db: D1, client: string, now = Date.now()): Promise<void> {
  const bucket = bucketOf(now);
  const bump = (key: string) =>
    db.prepare('INSERT INTO contact_hits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1').bind(key, bucket).run();
  await Promise.all([bump(client), bump(ALL)]);
  await db.prepare('DELETE FROM contact_hits WHERE bucket < ?').bind(bucket - 24).run();
}
