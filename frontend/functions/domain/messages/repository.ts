// All SQL for the contact_messages table (ADR 0009).
import { type D1 } from '../../infra/d1.ts';
import { type ContactInput } from './types.ts';

export type MessageRow = { id: number; name: string; email: string; subject: string; message: string; createdAt: number; readAt: number | null };
export type RecentRow = { id: number; name: string; subject: string; preview: string; createdAt: number; read: number };

export async function insertRow(db: D1, v: ContactInput): Promise<void> {
  await db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').bind(v.name, v.email, v.subject, v.message).run();
}

export async function listRows(db: D1, limit: number): Promise<MessageRow[]> {
  return (await db
    .prepare('SELECT id, name, email, subject, message, created_at AS createdAt, read_at AS readAt FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ?')
    .bind(limit)
    .all<MessageRow>()).results;
}

const changed = (run: { meta?: { changes?: number } }) => !!run.meta?.changes;

export const markRead = async (db: D1, id: number) => changed(await db.prepare('UPDATE contact_messages SET read_at = unixepoch() WHERE id = ?').bind(id).run());
export const markUnread = async (db: D1, id: number) => changed(await db.prepare('UPDATE contact_messages SET read_at = NULL WHERE id = ?').bind(id).run());
export const deleteRow = async (db: D1, id: number) => changed(await db.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run());

export async function totals(db: D1): Promise<{ total: number; unread: number }> {
  const row = await db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(read_at IS NULL), 0) AS unread FROM contact_messages').first<{ total: number; unread: number }>();
  return { total: row?.total ?? 0, unread: row?.unread ?? 0 };
}

// A short preview only, never the whole message, and no email address.
export async function recentRows(db: D1, limit: number): Promise<RecentRow[]> {
  return (await db
    .prepare('SELECT id, name, subject, substr(message, 1, 90) AS preview, created_at AS createdAt, read_at IS NOT NULL AS read FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ?')
    .bind(limit)
    .all<RecentRow>()).results;
}
