// GET /r/:slug (GNR-147): a short link the owner made in the admin panel. 302 by default, 301 when marked permanent.
// An unknown slug is a plain 404. A 301 may be cached by browsers for a long time, so it is the owner's deliberate choice.
import { followRedirect } from '../../domain/redirects/actions.ts';
import { SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';
import { dbOf } from '../../infra/d1.ts';

type Context = { request: Request; env: { DB?: unknown } };

const text = (body: string, status: number) => new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

async function go({ request, env }: Context): Promise<Response> {
  const slug = new URL(request.url).pathname.split('/').pop() ?? '';
  if (!SLUG_PATTERN.test(slug)) return text('Not found.', 404);
  const db = dbOf(env);
  if (!db) return text('Short links are not available right now.', 503);
  const hit = await followRedirect(db, slug);
  if (!hit) return text('Not found.', 404);
  return new Response(null, {
    status: hit.permanent ? 301 : 302,
    headers: { Location: new URL(hit.target, request.url).toString(), 'Cache-Control': hit.permanent ? 'public, max-age=3600' : 'no-store' },
  });
}

export const redirectRoute = { onRequestGet: go };
