// Contact messages in the admin panel (ADR 0009): GET /api/admin/messages lists them, POST /api/admin/messages/:id
// marks one read or unread, or deletes it. Every handler starts with requireAdmin.
import { adminMessages, changeMessage } from '../../domain/messages/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { idOf, jsonNoStore, validId } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const NOT_AVAILABLE = () => jsonNoStore({ error: 'The database is not available.' }, 503);

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  return db ? jsonNoStore(await adminMessages(db)) : NOT_AVAILABLE();
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return NOT_AVAILABLE();

  const id = idOf(request);
  if (!validId(id)) return jsonNoStore({ error: 'Not found.' }, 404);
  let action: unknown;
  try { action = ((await request.json()) as { action?: unknown }).action; } catch { return jsonNoStore({ error: 'Bad request.' }, 400); }

  const result = await changeMessage(db, id, action);
  if (result === 'unknown-action') return jsonNoStore({ error: 'Unknown action.' }, 400);
  return result === 'ok' ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
}

export const messagesRoute = { onRequestGet: list };
export const messageRoute = { onRequestPost: change };
