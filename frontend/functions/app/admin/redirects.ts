// Short links in the admin panel (GNR-147). Every handler starts with requireAdmin; changes also need the same origin.
//   GET  /api/admin/redirects        list            POST /api/admin/redirects       create
//   GET  /api/admin/redirects/:id    one             POST /api/admin/redirects/:id   { action: 'save', ...fields } or { action: 'delete' }
import { adminRedirect, adminRedirects, createRedirect, deleteRedirect, saveRedirect, type SaveResult } from '../../domain/redirects/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { idOf, jsonNoStore, readJson, validId } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 4_000;
const NOT_AVAILABLE = () => jsonNoStore({ error: 'The database is not available.' }, 503);
const NOT_FOUND = () => jsonNoStore({ error: 'Not found.' }, 404);

function answer(result: SaveResult, created = false): Response {
  if (result.ok) return jsonNoStore(created ? { ok: true, id: result.id } : { ok: true }, created ? 201 : 200);
  if (result.reason === 'invalid') return jsonNoStore({ error: 'Check the link.', errors: result.errors }, 400);
  if (result.reason === 'slug-taken') return jsonNoStore({ error: 'Check the link.', errors: { slug: 'That short name is already used by another link.' } }, 409);
  return NOT_FOUND();
}

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  return db ? jsonNoStore({ redirects: await adminRedirects(db) }) : NOT_AVAILABLE();
}

async function get({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return NOT_AVAILABLE();
  const id = idOf(request);
  if (!validId(id)) return NOT_FOUND();
  const redirect = await adminRedirect(db, id);
  return redirect ? jsonNoStore({ redirect }) : NOT_FOUND();
}

async function create({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return NOT_AVAILABLE();
  return answer(await createRedirect(db, await readJson(request, MAX_BODY)), true);
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return NOT_AVAILABLE();
  const id = idOf(request);
  if (!validId(id)) return NOT_FOUND();
  const body = await readJson(request, MAX_BODY);
  const action = (body as { action?: unknown } | undefined)?.action;
  if (action === 'delete') return (await deleteRedirect(db, id)) ? jsonNoStore({ ok: true }) : NOT_FOUND();
  if (action !== 'save') return jsonNoStore({ error: 'Unknown action.' }, 400);
  return answer(await saveRedirect(db, id, body));
}

export const adminRedirectsRoute = { onRequestGet: list, onRequestPost: create };
export const adminRedirectRoute = { onRequestGet: get, onRequestPost: change };
