// Feedback in the admin panel (GNR-148): GET /api/admin/feedback lists it, POST /api/admin/feedback/:id marks one read or
// unread, or deletes it. Every handler starts with requireAdmin.
import { adminFeedback, changeFeedback } from '../../domain/feedback/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { idOf, jsonNoStore, readJson, validId } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const NOT_AVAILABLE = () => jsonNoStore({ error: 'The database is not available.' }, 503);

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  return db ? jsonNoStore(await adminFeedback(db)) : NOT_AVAILABLE();
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return NOT_AVAILABLE();
  const id = idOf(request);
  if (!validId(id)) return jsonNoStore({ error: 'Not found.' }, 404);
  const body = await readJson(request, 1_000);
  if (body === undefined) return jsonNoStore({ error: 'Bad request.' }, 400);
  const result = await changeFeedback(db, id, (body as { action?: unknown }).action);
  if (result === 'unknown-action') return jsonNoStore({ error: 'Unknown action.' }, 400);
  return result === 'ok' ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
}

export const adminFeedbackRoute = { onRequestGet: list };
export const adminFeedbackItemRoute = { onRequestPost: change };
