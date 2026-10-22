// Single Worker entry (GNR-16, docs/adr/0001-single-worker.md).
// Only /api/* reaches this code (wrangler.jsonc run_worker_first); everything else
// is served straight from the static assets. Routes are one file each under
// functions/api/, exporting onRequestGet / onRequestPost taking { request, env }.
import { withSecurityHeaders } from './_lib/security-headers.ts';
import { rateLimit } from './_lib/rateLimit.ts';
import { runDue } from './cron/dispatcher.ts';
import { failure } from './_lib/failure.ts';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: unknown;
  RATE_LIMIT_SALT?: string;
  TURNSTILE_SECRET?: string;
}

type Context = { request: Request; env: Env };
type Handler = (context: Context) => Response | Promise<Response>;
// A route opts into rate limiting by exporting `rateLimit = { limit }` (requests per minute per caller).
type RouteModule = { onRequestGet?: Handler; onRequestPost?: Handler; rateLimit?: { limit: number } };

// URLPattern is a Workers built-in; no router dependency.
export const routes: Array<{ pattern: URLPattern; module: RouteModule }> = [
];

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const route = routes.find((r) => r.pattern.test(url));

  if (!route) {
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  }

  const handler =
    request.method === 'GET' || request.method === 'HEAD'
      ? route.module.onRequestGet
      : request.method === 'POST'
        ? route.module.onRequestPost
        : undefined;

  if (!handler) {
    const allow = [route.module.onRequestGet && 'GET', route.module.onRequestPost && 'POST']
      .filter(Boolean)
      .join(', ');
    return json({ error: 'Method not allowed.' }, 405, { Allow: allow });
  }

  if (route.module.rateLimit) {
    const limited = await rateLimit(request, env, { route: url.pathname, limit: route.module.rateLimit.limit });
    if (limited) return limited;
  }

  try {
    return await handler({ request, env });
  } catch (error) {
    return failure(error, request);
  }
}

export default {
  fetch: async (request: Request, env: Env) => withSecurityHeaders(await handle(request, env)),
  // The single cron trigger (wrangler.jsonc "triggers"); jobs are routed in cron/dispatcher.ts.
  scheduled: (event: { scheduledTime: number }, env: Env, ctx: { waitUntil: (p: Promise<unknown>) => void }) => {
    ctx.waitUntil(runDue(env, event.scheduledTime));
  },
};
