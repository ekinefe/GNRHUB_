// Contact messages in the admin panel (ADR 0009): GET /api/admin/messages lists them, POST /api/admin/messages/:id
// marks one read or unread, or deletes it. Every handler starts with requireAdmin.
import { jsonNoStore, requireAdmin } from '../../_lib/adminGuard.ts';

type D1 = {
  prepare: (sql: string) => {
    bind: (...v: unknown[]) => { all: <T>() => Promise<{ results: T[] }>; run: () => Promise<{ meta?: { changes?: number } }> };
    all: <T>() => Promise<{ results: T[] }>;
  };
};
type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const LIST_LIMIT = 200;

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const { results } = await (env.DB as D1)
    .prepare('SELECT id, name, email, subject, message, created_at AS createdAt, read_at AS readAt FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ?')
    .bind(LIST_LIMIT)
    .all<{ id: number; name: string; email: string; subject: string; message: string; createdAt: number; readAt: number | null }>();
  return jsonNoStore({ messages: results.map((m) => ({ ...m, read: m.readAt !== null })), unread: results.filter((m) => m.readAt === null).length });
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);

  const id = Number(new URL(request.url).pathname.split('/').pop());
  if (!Number.isInteger(id) || id < 1) return jsonNoStore({ error: 'Not found.' }, 404);
  let action: unknown;
  try { action = (await request.json() as { action?: unknown }).action; } catch { return jsonNoStore({ error: 'Bad request.' }, 400); }

  const db = env.DB as D1;
  let result;
  if (action === 'read') result = await db.prepare('UPDATE contact_messages SET read_at = unixepoch() WHERE id = ?').bind(id).run();
  else if (action === 'unread') result = await db.prepare('UPDATE contact_messages SET read_at = NULL WHERE id = ?').bind(id).run();
  else if (action === 'delete') result = await db.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();
  else return jsonNoStore({ error: 'Unknown action.' }, 400);

  return result.meta?.changes ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
}

export const messagesRoute = { onRequestGet: list };
export const messageRoute = { onRequestPost: change };
