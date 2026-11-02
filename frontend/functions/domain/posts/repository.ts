// All SQL for the posts table (ADR 0009). Fixed column lists and bound values only.
import { type D1 } from '../../infra/d1.ts';
import { type PostInput } from './types.ts';

export type ListRow = { id: number; slug: string; title: string; summary: string; tags: string; status: string; createdAt: number; updatedAt: number; publishedAt: number | null };
export type FullRow = ListRow & { body: string };
export type PublicRow = { id?: number; slug: string; title: string; summary: string; tags: string; body?: string; publishedAt: number };
export type Neighbour = { slug: string; title: string };

const ADMIN_COLUMNS = 'id, slug, title, summary, tags, status, created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt';

export const slugTaken = (e: unknown): boolean => e instanceof Error && /UNIQUE/i.test(e.message);

// ---- what visitors see: only status = 'public', ever --------------------------------------------------------------

export async function publicRows(db: D1, limit: number): Promise<PublicRow[]> {
  return (await db
    .prepare("SELECT slug, title, summary, tags, published_at AS publishedAt FROM posts WHERE status = 'public' ORDER BY published_at DESC, id DESC LIMIT ?")
    .bind(limit)
    .all<PublicRow>()).results;
}

export const publicBySlug = (db: D1, slug: string): Promise<PublicRow | null> =>
  db.prepare("SELECT id, slug, title, summary, tags, body, published_at AS publishedAt FROM posts WHERE slug = ? AND status = 'public'").bind(slug).first<PublicRow>();

/** The public post published just before this one. */
export const olderThan = (db: D1, post: { id?: number; publishedAt: number }): Promise<Neighbour | null> =>
  db
    .prepare("SELECT slug, title FROM posts WHERE status = 'public' AND (published_at < ? OR (published_at = ? AND id < ?)) ORDER BY published_at DESC, id DESC LIMIT 1")
    .bind(post.publishedAt, post.publishedAt, post.id)
    .first<Neighbour>();

/** The public post published just after this one. */
export const newerThan = (db: D1, post: { id?: number; publishedAt: number }): Promise<Neighbour | null> =>
  db
    .prepare("SELECT slug, title FROM posts WHERE status = 'public' AND (published_at > ? OR (published_at = ? AND id > ?)) ORDER BY published_at ASC, id ASC LIMIT 1")
    .bind(post.publishedAt, post.publishedAt, post.id)
    .first<Neighbour>();

export async function sitemapRows(db: D1, limit: number): Promise<Array<{ slug: string; updatedAt: number }>> {
  return (await db
    .prepare("SELECT slug, updated_at AS updatedAt FROM posts WHERE status = 'public' ORDER BY published_at DESC LIMIT ?")
    .bind(limit)
    .all<{ slug: string; updatedAt: number }>()).results;
}

// ---- the admin: every status ---------------------------------------------------------------------------------------

export async function adminRows(db: D1, limit: number): Promise<ListRow[]> {
  return (await db.prepare('SELECT ' + ADMIN_COLUMNS + ' FROM posts ORDER BY updated_at DESC, id DESC LIMIT ?').bind(limit).all<ListRow>()).results;
}

export const findRow = (db: D1, id: number): Promise<FullRow | null> =>
  db.prepare('SELECT ' + ADMIN_COLUMNS + ', body FROM posts WHERE id = ?').bind(id).first<FullRow>();

// A post gets its publish date the first time it is public, and keeps it if it goes back to draft and is published again.
export async function insertRow(db: D1, v: PostInput): Promise<number | undefined> {
  const run = await db
    .prepare("INSERT INTO posts (slug, title, summary, body, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'public' THEN unixepoch() END)")
    .bind(v.slug, v.title, v.summary, v.body, v.tags, v.status, v.status)
    .run();
  return run.meta?.last_row_id;
}

export async function updateRow(db: D1, id: number, v: PostInput): Promise<boolean> {
  const run = await db
    .prepare("UPDATE posts SET slug = ?, title = ?, summary = ?, body = ?, tags = ?, status = ?, updated_at = unixepoch(), published_at = CASE WHEN ? = 'public' AND published_at IS NULL THEN unixepoch() ELSE published_at END WHERE id = ?")
    .bind(v.slug, v.title, v.summary, v.body, v.tags, v.status, v.status, id)
    .run();
  return !!run.meta?.changes;
}

export async function deleteRow(db: D1, id: number): Promise<boolean> {
  return !!(await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()).meta?.changes;
}

// ---- the admin overview --------------------------------------------------------------------------------------------

export async function countsByStatus(db: D1): Promise<Record<string, number>> {
  const { results } = await db.prepare('SELECT status, COUNT(*) AS n FROM posts GROUP BY status').all<{ status: string; n: number }>();
  return Object.fromEntries(results.map((r) => [r.status, r.n]));
}

export async function recentRows(db: D1, limit: number): Promise<Array<{ id: number; title: string; status: string; updatedAt: number }>> {
  return (await db.prepare('SELECT id, title, status, updated_at AS updatedAt FROM posts ORDER BY updated_at DESC, id DESC LIMIT ?').bind(limit).all<{ id: number; title: string; status: string; updatedAt: number }>()).results;
}
