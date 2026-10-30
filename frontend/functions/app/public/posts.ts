// Public blog API (ADR 0009): GET /api/posts and GET /api/posts/:slug. Only posts with status "public" are ever
// returned; a draft or private post answers exactly like one that does not exist (404).
import { SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';
import { type D1 } from '../../infra/d1.ts';
import { json } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };
type Row = { id?: number; slug: string; title: string; summary: string; tags: string; body?: string; publishedAt: number };
type Neighbour = { slug: string; title: string };

const SHORT_CACHE = { 'Cache-Control': 'public, max-age=60' };
const tagsOf = (csv: string) => (csv ? csv.split(',') : []);
const LIMIT = 100;

async function list({ request, env }: Context): Promise<Response> {
  if (!env.DB) return json({ error: 'Posts are not available right now.' }, 503);
  const tag = new URL(request.url).searchParams.get('tag')?.toLowerCase() ?? '';
  const { results } = await (env.DB as D1)
    .prepare("SELECT slug, title, summary, tags, published_at AS publishedAt FROM posts WHERE status = 'public' ORDER BY published_at DESC, id DESC LIMIT ?")
    .bind(LIMIT)
    .all<Row>();
  const posts = results.map((p) => ({ ...p, tags: tagsOf(p.tags) })).filter((p) => !tag || p.tags.includes(tag));
  return json({ posts }, 200, SHORT_CACHE);
}

async function one({ request, env }: Context): Promise<Response> {
  let slug = '';
  try { slug = decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? ''); } catch { return json({ error: 'Not found.' }, 404); }
  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Not found.' }, 404);
  if (!env.DB) return json({ error: 'Posts are not available right now.' }, 503);
  const db = env.DB as D1;
  const post = await db
    .prepare("SELECT id, slug, title, summary, tags, body, published_at AS publishedAt FROM posts WHERE slug = ? AND status = 'public'")
    .bind(slug)
    .first<Row>();
  if (!post) return json({ error: 'Not found.' }, 404);
  // The public post published just before (older) and just after (newer) this one.
  const older = await db
    .prepare("SELECT slug, title FROM posts WHERE status = 'public' AND (published_at < ? OR (published_at = ? AND id < ?)) ORDER BY published_at DESC, id DESC LIMIT 1")
    .bind(post.publishedAt, post.publishedAt, post.id)
    .first<Neighbour>();
  const newer = await db
    .prepare("SELECT slug, title FROM posts WHERE status = 'public' AND (published_at > ? OR (published_at = ? AND id > ?)) ORDER BY published_at ASC, id ASC LIMIT 1")
    .bind(post.publishedAt, post.publishedAt, post.id)
    .first<Neighbour>();
  const { id: _id, ...rest } = post;
  return json({ post: { ...rest, tags: tagsOf(post.tags), older, newer } }, 200, SHORT_CACHE);
}

export const postsRoute = { onRequestGet: list };
export const postRoute = { onRequestGet: one };
