// All SQL for the projects table (ADR 0012). Fixed column lists and bound values only, never text built from a request.
import { type D1 } from '../../infra/d1.ts';
import { type ProjectInput } from './types.ts';

export type Row = {
  slug: string; grp: string; name: string; kind: string; summary: string; tech: string; points: string; status: string;
  repo: string | null; url: string | null; image: string | null; imageAlt: string; caseStudy: string | null; learned: string;
  featured: number; inAbout: number;
};
export type AdminRow = Row & { id: number; sort: number; visible: number };

const COLUMNS = 'slug, grp, name, kind, summary, tech, points, status, repo, url, image, image_alt AS imageAlt, case_study AS caseStudy, learned, featured, in_about AS inAbout';
const ADMIN_COLUMNS = 'id, sort, visible, ' + COLUMNS;
const WRITE = (v: ProjectInput) => [v.slug, v.grp, v.name, v.kind, v.summary, v.tech.join(','), v.points.join('\n'), v.status, v.repo, v.url, v.image, v.imageAlt, v.caseStudy, v.learned, v.featured ? 1 : 0, v.inAbout ? 1 : 0, v.visible ? 1 : 0, v.sort];

export const slugTaken = (e: unknown): boolean => e instanceof Error && /UNIQUE/i.test(e.message);

export async function visibleRows(db: D1): Promise<Row[]> {
  return (await db.prepare('SELECT ' + COLUMNS + ' FROM projects WHERE visible = 1 ORDER BY sort, id').all<Row>()).results;
}

export async function countAll(db: D1): Promise<number> {
  return (await db.prepare('SELECT COUNT(*) AS n FROM projects').first<{ n: number }>())?.n ?? 0;
}

export async function allRows(db: D1): Promise<AdminRow[]> {
  return (await db.prepare('SELECT ' + ADMIN_COLUMNS + ' FROM projects ORDER BY grp, sort, id').all<AdminRow>()).results;
}

export const findRow = (db: D1, id: number): Promise<AdminRow | null> =>
  db.prepare('SELECT ' + ADMIN_COLUMNS + ' FROM projects WHERE id = ?').bind(id).first<AdminRow>();

/** The new id. Throws when the slug is already used (see slugTaken). */
export async function insertRow(db: D1, v: ProjectInput): Promise<number | undefined> {
  const run = await db
    .prepare('INSERT INTO projects (slug, grp, name, kind, summary, tech, points, status, repo, url, image, image_alt, case_study, learned, featured, in_about, visible, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(...WRITE(v))
    .run();
  return run.meta?.last_row_id;
}

/** True when a row was changed. Throws when the slug is already used. */
export async function updateRow(db: D1, id: number, v: ProjectInput): Promise<boolean> {
  const run = await db
    .prepare('UPDATE projects SET slug = ?, grp = ?, name = ?, kind = ?, summary = ?, tech = ?, points = ?, status = ?, repo = ?, url = ?, image = ?, image_alt = ?, case_study = ?, learned = ?, featured = ?, in_about = ?, visible = ?, sort = ?, updated_at = unixepoch() WHERE id = ?')
    .bind(...WRITE(v), id)
    .run();
  return !!run.meta?.changes;
}

export async function deleteRow(db: D1, id: number): Promise<boolean> {
  return !!(await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run()).meta?.changes;
}
