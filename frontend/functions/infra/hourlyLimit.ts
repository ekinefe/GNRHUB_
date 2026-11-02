// A per-hour allowance for a public form: each client and everyone together may use so many per hour, counted in a
// table shaped (key, bucket, count). The client key is an HMAC of the address, so no address is stored.
// The table name comes from code, never from a visitor.
import { type D1 } from './d1.ts';

export const WINDOW_SECONDS = 60 * 60;
const ALL = '*';
const bucketOf = (now: number) => Math.floor(now / 1000 / WINDOW_SECONDS);

export async function clientKey(request: Request, secret: string, purpose: string): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${purpose}:${ip}`)));
  return [...mac.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hourlyLimit(table: string, perClient: number, global: number) {
  if (!/^[a-z_]+$/.test(table)) throw new Error('Bad table name');

  /** Seconds to wait when this client (or everyone) has used the hour's allowance, otherwise 0. */
  async function lockedFor(db: D1, client: string, now = Date.now()): Promise<number> {
    const bucket = bucketOf(now);
    const count = async (key: string) =>
      (await db.prepare(`SELECT count FROM ${table} WHERE key = ? AND bucket = ?`).bind(key, bucket).first<{ count: number }>())?.count ?? 0;
    const [mine, all] = await Promise.all([count(client), count(ALL)]);
    if (mine < perClient && all < global) return 0;
    return WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
  }

  async function record(db: D1, client: string, now = Date.now()): Promise<void> {
    const bucket = bucketOf(now);
    const bump = (key: string) =>
      db.prepare(`INSERT INTO ${table} (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1`).bind(key, bucket).run();
    await Promise.all([bump(client), bump(ALL)]);
    await db.prepare(`DELETE FROM ${table} WHERE bucket < ?`).bind(bucket - 24).run();
  }

  return { lockedFor, record };
}
