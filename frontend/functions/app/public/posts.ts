// Public blog API (ADR 0009): GET /api/posts and GET /api/posts/:slug. Only posts with status "public" are ever
// returned; a draft or private post answers exactly like one that does not exist (404).
import { publicPost, publicPosts } from '../../domain/posts/actions.ts';
import { SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';
import { dbOf } from '../../infra/d1.ts';
import { json } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

const SHORT_CACHE = { 'Cache-Control': 'public, max-age=60' };
const UNAVAILABLE = () => json({ error: 'Posts are not available right now.' }, 503);

async function list({ request, env }: Context): Promise<Response> {
  const db = dbOf(env);
  if (!db) return UNAVAILABLE();
  const tag = new URL(request.url).searchParams.get('tag') ?? '';
  return json({ posts: await publicPosts(db, tag) }, 200, SHORT_CACHE);
}

async function one({ request, env }: Context): Promise<Response> {
  let slug = '';
  try { slug = decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? ''); } catch { return json({ error: 'Not found.' }, 404); }
  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Not found.' }, 404);
  const db = dbOf(env);
  if (!db) return UNAVAILABLE();
  const post = await publicPost(db, slug);
  return post ? json({ post }, 200, SHORT_CACHE) : json({ error: 'Not found.' }, 404);
}

export const postsRoute = { onRequestGet: list };
export const postRoute = { onRequestGet: one };
