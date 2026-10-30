// Single Worker entry (GNR-16, docs/adr/0001-single-worker.md).
// Only /api/*, /sitemap.xml and /blog/feed.xml reach this code (wrangler.jsonc run_worker_first); everything else
// is served straight from the static assets. Routes are one file each under
// functions/api/, exporting onRequestGet / onRequestPost taking { request, env }.
import { withSecurityHeaders } from './infra/security-headers.ts';
import { failure, isAdminPath } from './infra/failure.ts';
import { currentAdmin } from './app/admin/guard.ts';
import { loginRoute, logoutRoute, meRoute } from './modules/admin/auth.ts';
import { messagesRoute, messageRoute } from './modules/admin/messages.ts';
import { contactRoute } from './modules/contact/api.ts';
import { adminPostsRoute, adminPostRoute } from './app/admin/posts.ts';
import { summaryRoute } from './modules/admin/summary.ts';
import { postsRoute, postRoute } from './app/public/posts.ts';
import { sitemapRoute } from './app/public/sitemap.ts';
import { feedRoute } from './app/public/feed.ts';
import { statusRoute } from './modules/status/api.ts';
import { projectsRoute } from './app/public/projects.ts';
import { adminProjectsRoute, adminProjectRoute } from './app/admin/projects.ts';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  // D1, bound in wrangler.jsonc. Absent until the database exists, so code must handle `undefined`.
  DB?: unknown;
  // Admin sign-in secrets (ADR 0009); set with `wrangler secret put`, never in wrangler.jsonc.
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  // Optional: when set, sign-in also needs a code from an authenticator app (ADR 0010).
  ADMIN_TOTP_SECRET?: string;
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
  { pattern: new URLPattern({ pathname: '/api/status' }), module: statusRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/projects' }), module: adminProjectsRoute },
  { pattern: new URLPattern({ pathname: '/api/admin/projects/:id' }), module: adminProjectRoute },
  { pattern: new URLPattern({ pathname: '/api/projects' }), module: projectsRoute },
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

// One structured log line per request (shown in Workers observability, wrangler.jsonc). It holds a request id, the
// method, the path without its query string, the status and the time taken: never an IP address, cookie or body.
// The same id goes back in the X-Request-Id header so a visitor's report can be matched to a log line.
export async function observed(request: Request, env: Env): Promise<Response> {
  const id = crypto.randomUUID();
  const started = Date.now();
  let response: Response;
  try {
    response = withSecurityHeaders(await handle(request, env));
  } catch (error) {
    console.error(JSON.stringify({ id, method: request.method, path: new URL(request.url).pathname, error: error instanceof Error ? error.name : 'Error' }));
    throw error;
  }
  response.headers.set('X-Request-Id', id);
  console.log(JSON.stringify({ id, method: request.method, path: new URL(request.url).pathname, status: response.status, ms: Date.now() - started }));
  return response;
}

export default {
  fetch: observed,
};
