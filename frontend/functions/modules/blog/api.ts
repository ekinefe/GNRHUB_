// Public blog API (ADR 0009): GET /api/posts and GET /api/posts/:slug. Only posts with status "public" are ever
// returned; a draft or private post answers exactly like one that does not exist (404).
import { SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';

type D1 = {
  prepare: (sql: string) => {
    bind: (...v: unknown[]) => { all: <T>() => Promise<{ results: T[] }>; first: <T>() => Promise<T | null> };
  };
};
type Context = { request: Request; env: { DB?: unknown } };
type Row = { slug: string; title: string; summary: string; tags: string; body?: string; publishedAt: number };

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...extra } });

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
  const post = await (env.DB as D1)
    .prepare("SELECT slug, title, summary, tags, body, published_at AS publishedAt FROM posts WHERE slug = ? AND status = 'public'")
    .bind(slug)
    .first<Row>();
  if (!post) return json({ error: 'Not found.' }, 404);
  return json({ post: { ...post, tags: tagsOf(post.tags) } }, 200, SHORT_CACHE);
}

export const postsRoute = { onRequestGet: list };
export const postRoute = { onRequestGet: one };
