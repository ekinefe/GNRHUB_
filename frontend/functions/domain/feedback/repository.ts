// All SQL for the feedback table (GNR-148).
import { type D1 } from '../../infra/d1.ts';
import { type FeedbackInput } from './types.ts';

export type FeedbackRow = { id: number; kind: string; page: string; message: string; email: string; createdAt: number; readAt: number | null };
const COLUMNS = 'id, kind, page, message, email, created_at AS createdAt, read_at AS readAt';

export async function insertRow(db: D1, v: FeedbackInput): Promise<void> {
  await db.prepare('INSERT INTO feedback (kind, page, message, email) VALUES (?, ?, ?, ?)').bind(v.kind, v.page, v.message, v.email).run();
}

export async function listRows(db: D1, limit: number): Promise<FeedbackRow[]> {
  return (await db.prepare('SELECT ' + COLUMNS + ' FROM feedback ORDER BY created_at DESC, id DESC LIMIT ?').bind(limit).all<FeedbackRow>()).results;
}

const changed = (run: { meta?: { changes?: number } }) => !!run.meta?.changes;
export const markRead = async (db: D1, id: number) => changed(await db.prepare('UPDATE feedback SET read_at = unixepoch() WHERE id = ?').bind(id).run());
export const markUnread = async (db: D1, id: number) => changed(await db.prepare('UPDATE feedback SET read_at = NULL WHERE id = ?').bind(id).run());
export const deleteRow = async (db: D1, id: number) => changed(await db.prepare('DELETE FROM feedback WHERE id = ?').bind(id).run());
