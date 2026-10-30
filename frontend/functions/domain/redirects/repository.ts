// All SQL for the redirects table (GNR-147).
import { type D1 } from '../../infra/d1.ts';
import { type RedirectInput } from './types.ts';

export type Row = { id: number; slug: string; target: string; permanent: number; clicks: number; updatedAt: number };

const COLUMNS = 'id, slug, target, permanent, clicks, updated_at AS updatedAt';

export const slugTaken = (e: unknown): boolean => e instanceof Error && /UNIQUE/i.test(e.message);

export async function allRows(db: D1): Promise<Row[]> {
  return (await db.prepare('SELECT ' + COLUMNS + ' FROM redirects ORDER BY slug').all<Row>()).results;
}

export const findRow = (db: D1, id: number): Promise<Row | null> =>
  db.prepare('SELECT ' + COLUMNS + ' FROM redirects WHERE id = ?').bind(id).first<Row>();

export const findBySlug = (db: D1, slug: string): Promise<Pick<Row, 'target' | 'permanent'> | null> =>
  db.prepare('SELECT target, permanent FROM redirects WHERE slug = ?').bind(slug).first<Pick<Row, 'target' | 'permanent'>>();

export async function countVisit(db: D1, slug: string): Promise<void> {
  await db.prepare('UPDATE redirects SET clicks = clicks + 1 WHERE slug = ?').bind(slug).run();
}

export async function insertRow(db: D1, v: RedirectInput): Promise<number | undefined> {
  const run = await db.prepare('INSERT INTO redirects (slug, target, permanent) VALUES (?, ?, ?)').bind(v.slug, v.target, v.permanent ? 1 : 0).run();
  return run.meta?.last_row_id;
}

export async function updateRow(db: D1, id: number, v: RedirectInput): Promise<boolean> {
  const run = await db
    .prepare('UPDATE redirects SET slug = ?, target = ?, permanent = ?, updated_at = unixepoch() WHERE id = ?')
    .bind(v.slug, v.target, v.permanent ? 1 : 0, id)
    .run();
  return !!run.meta?.changes;
}

export async function deleteRow(db: D1, id: number): Promise<boolean> {
  return !!(await db.prepare('DELETE FROM redirects WHERE id = ?').bind(id).run()).meta?.changes;
}
