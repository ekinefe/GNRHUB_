// All SQL for legal_documents (GNR-161).
import { type D1 } from '../../infra/d1.ts';
import { type Doc, type LegalInput } from './types.ts';

export type VersionRow = { version: number; summary: string; body: string; createdAt: number };
const COLUMNS = 'version, summary, body, created_at AS createdAt';

export const newest = (db: D1, doc: Doc): Promise<VersionRow | null> =>
  db.prepare('SELECT ' + COLUMNS + ' FROM legal_documents WHERE doc = ? ORDER BY version DESC LIMIT 1').bind(doc).first<VersionRow>();

export const byVersion = (db: D1, doc: Doc, version: number): Promise<VersionRow | null> =>
  db.prepare('SELECT ' + COLUMNS + ' FROM legal_documents WHERE doc = ? AND version = ?').bind(doc, version).first<VersionRow>();

export async function versions(db: D1, doc: Doc, limit: number): Promise<Array<{ version: number; createdAt: number }>> {
  return (await db.prepare('SELECT version, created_at AS createdAt FROM legal_documents WHERE doc = ? ORDER BY version DESC LIMIT ?').bind(doc, limit).all<{ version: number; createdAt: number }>()).results;
}

/** Adds the next version in one statement, so two saves at once cannot take the same number. Returns it. */
export async function addVersion(db: D1, doc: Doc, v: LegalInput): Promise<number> {
  await db
    .prepare('INSERT INTO legal_documents (doc, version, summary, body) SELECT ?, COALESCE(MAX(version), 0) + 1, ?, ? FROM legal_documents WHERE doc = ?')
    .bind(doc, v.summary, v.body, doc)
    .run();
  return (await newest(db, doc))?.version ?? 0;
}
