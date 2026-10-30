// Blog posts in the admin panel (ADR 0009). Every handler starts with requireAdmin; changes also need the same origin.
//   GET  /api/admin/posts        list (no bodies)        POST /api/admin/posts       create
//   GET  /api/admin/posts/:id    one, with the body      POST /api/admin/posts/:id   { action: 'save', ...fields } or { action: 'delete' }
import { requireAdmin } from '../../app/admin/guard.ts';
import { type D1 } from '../../infra/d1.ts';
import { idOf, jsonNoStore, readJson as readBody, validId } from '../../infra/http.ts';
import { validatePost } from '../blog/validate.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 120_000;
// Fixed column list, never built from request data.
const COLUMNS = 'id, slug, title, summary, tags, status, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt';
const withTags = <T extends { tags: string }>(p: T) => ({ ...p, tags: p.tags ? p.tags.split(',') : [] });
const taken = (e: unknown) => e instanceof Error && /UNIQUE/i.test(e.message);

const readJson = (request: Request) => readBody(request, MAX_BODY);

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const { results } = await (env.DB as D1).prepare('SELECT ' + COLUMNS + ' FROM posts ORDER BY updated_at DESC, id DESC LIMIT ?').bind(500).all<{ tags: string }>();
  return jsonNoStore({ posts: results.map(withTags) });
}

async function get({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const id = idOf(request);
  if (!validId(id)) return jsonNoStore({ error: 'Not found.' }, 404);
  const post = await (env.DB as D1).prepare('SELECT ' + COLUMNS + ', body FROM posts WHERE id = ?').bind(id).first<{ tags: string }>();
  return post ? jsonNoStore({ post: withTags(post) }) : jsonNoStore({ error: 'Not found.' }, 404);
}

async function create({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const result = validatePost(await readJson(request));
  if (!result.ok) return jsonNoStore({ error: 'Check the post.', errors: result.errors }, 400);
  const { title, slug, summary, body, tags, status } = result.value;
  try {
    const run = await (env.DB as D1)
      .prepare("INSERT INTO posts (slug, title, summary, body, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'public' THEN unixepoch() END)")
      .bind(slug, title, summary, body, tags, status, status)
      .run();
    return jsonNoStore({ ok: true, id: run.meta?.last_row_id }, 201);
  } catch (e) {
    if (taken(e)) return jsonNoStore({ error: 'Check the post.', errors: { slug: 'That address is already used by another post.' } }, 409);
    throw e;
  }
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const id = idOf(request);
  if (!validId(id)) return jsonNoStore({ error: 'Not found.' }, 404);
  const body = await readJson(request);
  const action = (body as { action?: unknown } | undefined)?.action;
  const db = env.DB as D1;

  if (action === 'delete') {
    const run = await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return run.meta?.changes ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
  }
  if (action !== 'save') return jsonNoStore({ error: 'Unknown action.' }, 400);

  const result = validatePost(body);
  if (!result.ok) return jsonNoStore({ error: 'Check the post.', errors: result.errors }, 400);
  const { title, slug, summary, body: content, tags, status } = result.value;
  try {
    const run = await db
      .prepare("UPDATE posts SET slug = ?, title = ?, summary = ?, body = ?, tags = ?, status = ?, updated_at = unixepoch(), published_at = CASE WHEN ? = 'public' AND published_at IS NULL THEN unixepoch() ELSE published_at END WHERE id = ?")
      .bind(slug, title, summary, content, tags, status, status, id)
      .run();
    return run.meta?.changes ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
  } catch (e) {
    if (taken(e)) return jsonNoStore({ error: 'Check the post.', errors: { slug: 'That address is already used by another post.' } }, 409);
    throw e;
  }
}

export const adminPostsRoute = { onRequestGet: list, onRequestPost: create };
export const adminPostRoute = { onRequestGet: get, onRequestPost: change };
