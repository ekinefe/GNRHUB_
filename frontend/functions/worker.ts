// Single Worker entry (GNR-16, docs/adr/0001-single-worker.md).
// Only /api/*, /sitemap.xml and /blog/feed.xml reach this code (wrangler.jsonc run_worker_first); everything else
// is served straight from the static assets. Routes are one file each under
// functions/api/, exporting onRequestGet / onRequestPost taking { request, env }.
import { withSecurityHeaders } from './_lib/security-headers.ts';
import { failure, isAdminPath } from './_lib/failure.ts';
import { currentAdmin } from './_lib/adminGuard.ts';
import { loginRoute, logoutRoute, meRoute } from './modules/admin/auth.ts';
import { messagesRoute, messageRoute } from './modules/admin/messages.ts';
import { contactRoute } from './modules/contact/api.ts';
import { adminPostsRoute, adminPostRoute } from './modules/admin/posts.ts';
import { summaryRoute } from './modules/admin/summary.ts';
import { postsRoute, postRoute } from './modules/blog/api.ts';
import { sitemapRoute } from './modules/blog/sitemap.ts';
import { feedRoute } from './modules/blog/feed.ts';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  // D1, bound in wrangler.jsonc. Absent until the database exists, so code must handle `undefined`.
  DB?: unknown;
  // Admin sign-in secrets (ADR 0009); set with `wrangler secret put`, never in wrangler.jsonc.
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
}

type Context = { request: Request; env: Env };
type Handler = (context: Context) => Response | Promise<Response>;
type RouteModule = { onRequestGet?: Handler; onRequestPost?: Handler };

// URLPattern is a Workers built-in; no router dependency.
export const routes: Array<{ pattern: URLPattern; module: RouteModule }> = [
  { pattern: new URLPattern({ pathname: '/api/admin/login' }), module: loginRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/logout' }), module: logoutRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/me' }), module: meRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/summary' }), module: summaryRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/messages' }), module: messagesRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/messages/:id' }), module: messageRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/posts' }), module: adminPostsRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/posts/:id' }), module: adminPostRoute },
  { pattern: new URLPattern({ pathname: '/api/contact' }), module: contactRoute },
  { pattern: new URLPattern({ pathname: '/api/posts' }), module: postsRoute },
  { pattern: new URLPattern({ pathname: '/api/posts/:slug' }), module: postRoute },
  { pattern: new URLPattern({ pathname: '/sitemap.xml' }), module: sitemapRoute },
  { pattern: new URLPattern({ pathname: '/blog/feed.xml' }), module: feedRoute },
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

  try {
    return await handler({ request, env });
  } catch (error) {
    const verifiedAdmin = isAdminPath(url.pathname) && !!(await currentAdmin(request, env));
    return failure(error, request, verifiedAdmin);
  }
}

export default {
  fetch: async (request: Request, env: Env) => withSecurityHeaders(await handle(request, env)),
};
