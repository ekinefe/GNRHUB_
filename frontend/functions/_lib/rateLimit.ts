// Fixed-window rate limiting on D1 (GNR-133). No KV or Durable Object needed.
// key = route + salted SHA-256 of the client IP (the raw IP is never stored),
// bucket = minute. Fails open if the counter cannot be written, and sweeps old rows
// on about 1 in 100 requests.
type D1 = {
  prepare: (sql: string) => {
    bind: (...v: unknown[]) => { first: <T = unknown>() => Promise<T | null>; run: () => Promise<unknown> };
  };
};

export type RateLimitEnv = { DB?: unknown; RATE_LIMIT_SALT?: string };
export type RateLimitOptions = { route: string; limit: number; now?: number; random?: () => number };

const WINDOW_SECONDS = 60;

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Returns a 429 Response when the caller is over the limit, otherwise null.
// With no RATE_LIMIT_SALT configured the limiter is off (fails open).
export async function rateLimit(request: Request, env: RateLimitEnv, options: RateLimitOptions): Promise<Response | null> {
  const { route, limit, now = Date.now(), random = Math.random } = options;
  try {
    const salt = env.RATE_LIMIT_SALT;
    const db = env.DB as D1 | undefined;
    if (!salt || !db?.prepare) return null;

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const key = `${route}:${await hashIp(ip, salt)}`;
    const bucket = Math.floor(now / 1000 / WINDOW_SECONDS);

    const row = await db
      .prepare(
        `INSERT INTO rate_limit_hits (key, bucket, count) VALUES (?, ?, 1)
         ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1
         RETURNING count`,
      )
      .bind(key, bucket)
      .first<{ count: number }>();

    if (random() < 0.01) {
      await db.prepare('DELETE FROM rate_limit_hits WHERE bucket < ?').bind(bucket - 5).run();
    }

    if (row && row.count > limit) {
      const retryAfter = WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
      return new Response(JSON.stringify({ error: 'Too many requests.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
      });
    }
    return null;
  } catch (error) {
    console.error('Rate limit check failed, allowing request:', error);
    return null;
  }
}
