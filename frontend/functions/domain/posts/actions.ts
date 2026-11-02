// What can be done with blog posts (ADR 0009). Plain functions; app/ turns the results into answers.
// Visitors only ever get posts whose status is "public": a draft or private post is simply not found.
import { type D1 } from '../../infra/d1.ts';
import { toAdminPost, toPublicPost, tagsOf } from './present.ts';
import { adminRows, countsByStatus, deleteRow, findRow, insertRow, newerThan, olderThan, publicBySlug, publicRows, recentRows, sitemapRows, slugTaken, updateRow } from './repository.ts';
import { validatePost } from './validate.ts';

const PUBLIC_LIST_LIMIT = 100;
const ADMIN_LIST_LIMIT = 500;
export const FEED_LIMIT = 20;
export const SITEMAP_LIMIT = 1000;

export type SaveResult =
  | { ok: true; id?: number }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> }
  | { ok: false; reason: 'slug-taken' }
  | { ok: false; reason: 'not-found' };

// ---- visitors ------------------------------------------------------------------------------------------------------

export async function publicPosts(db: D1, tag = '') {
  const rows = await publicRows(db, PUBLIC_LIST_LIMIT);
  const wanted = tag.toLowerCase();
  return rows.map(toPublicPost).filter((p) => !wanted || p.tags.includes(wanted));
}

/** One public post with its neighbours, or null (also for a draft or private post). */
export async function publicPost(db: D1, slug: string) {
  const post = await publicBySlug(db, slug);
  if (!post) return null;
  const [older, newer] = [await olderThan(db, post), await newerThan(db, post)];
  const { id: _id, ...rest } = post;
  return { ...rest, tags: tagsOf(post.tags), older, newer };
}

/** The newest public posts, for the feed. */
export const feedPosts = (db: D1) => publicRows(db, FEED_LIMIT);

export const sitemapPosts = (db: D1) => sitemapRows(db, SITEMAP_LIMIT);

// ---- the owner -----------------------------------------------------------------------------------------------------

export async function adminPosts(db: D1) {
  return (await adminRows(db, ADMIN_LIST_LIMIT)).map(toAdminPost);
}

export async function adminPost(db: D1, id: number) {
  const row = await findRow(db, id);
  return row ? toAdminPost(row) : null;
}

export async function createPost(db: D1, input: unknown): Promise<SaveResult> {
  const result = validatePost(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return { ok: true, id: await insertRow(db, result.value) };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export async function savePost(db: D1, id: number, input: unknown): Promise<SaveResult> {
  const result = validatePost(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return (await updateRow(db, id, result.value)) ? { ok: true } : { ok: false, reason: 'not-found' };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export const deletePost = (db: D1, id: number): Promise<boolean> => deleteRow(db, id);

/** Posts by status and the most recently edited ones, for the admin overview. */
export async function postOverview(db: D1) {
  const counts = await countsByStatus(db);
  return {
    counts: { draft: counts.draft ?? 0, private: counts.private ?? 0, public: counts.public ?? 0 },
    recent: await recentRows(db, 5),
  };
}
