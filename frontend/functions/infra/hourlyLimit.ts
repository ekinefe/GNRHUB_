// A per-hour allowance for a public form: each client and everyone together may use so many per hour, counted in a
// table shaped (key, bucket, count). The client key is an HMAC of the address, so no address is stored.
// Each table has its own fixed statements below.
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

// One fixed set of statements per table, written out in full: SQL is never built from a variable.
const SQL = {
  feedback_hits: {
    count: 'SELECT count FROM feedback_hits WHERE key = ? AND bucket = ?',
    bump: 'INSERT INTO feedback_hits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1',
    prune: 'DELETE FROM feedback_hits WHERE bucket < ?',
  },
} as const;
export type LimitTable = keyof typeof SQL;

export function hourlyLimit(table: LimitTable, perClient: number, global: number) {
  const sql = SQL[table];
  if (!sql) throw new Error('Unknown table');

  /** Seconds to wait when this client (or everyone) has used the hour's allowance, otherwise 0. */
  async function lockedFor(db: D1, client: string, now = Date.now()): Promise<number> {
    const bucket = bucketOf(now);
    const count = async (key: string) => (await db.prepare(sql.count).bind(key, bucket).first<{ count: number }>())?.count ?? 0;
    const [mine, all] = await Promise.all([count(client), count(ALL)]);
    if (mine < perClient && all < global) return 0;
    return WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
  }

  async function record(db: D1, client: string, now = Date.now()): Promise<void> {
    const bucket = bucketOf(now);
    const bump = (key: string) => db.prepare(sql.bump).bind(key, bucket).run();
    await Promise.all([bump(client), bump(ALL)]);
    await db.prepare(sql.prune).bind(bucket - 24).run();
  }

  return { lockedFor, record };
}
