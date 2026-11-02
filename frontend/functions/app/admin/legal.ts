// The legal texts in the admin panel (GNR-161). Every handler starts with requireAdmin; saving also needs the same origin.
//   GET  /api/admin/legal/:doc[?version=n]   the newest (or chosen) version and the list of versions
//   POST /api/admin/legal/:doc               { summary, body } saves a new version
import { adminLegal, saveLegal } from '../../domain/legal/actions.ts';
import { isDoc } from '../../domain/legal/types.ts';
import { dbOf } from '../../infra/d1.ts';
import { jsonNoStore, readJson } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 40_000;
const docOf = (request: Request) => new URL(request.url).pathname.split('/').pop();

async function read({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const doc = docOf(request);
  if (!isDoc(doc)) return jsonNoStore({ error: 'Not found.' }, 404);
  const db = dbOf(env);
  if (!db) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const raw = new URL(request.url).searchParams.get('version');
  const version = raw === null ? undefined : Number(raw);
  if (version !== undefined && (!Number.isInteger(version) || version < 1)) return jsonNoStore({ error: 'Not found.' }, 404);
  const found = await adminLegal(db, doc, version);
  return version !== undefined && !found.current ? jsonNoStore({ error: 'Not found.' }, 404) : jsonNoStore(found);
}

async function save({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  const doc = docOf(request);
  if (!isDoc(doc)) return jsonNoStore({ error: 'Not found.' }, 404);
  const db = dbOf(env);
  if (!db) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const result = await saveLegal(db, doc, await readJson(request, MAX_BODY));
  if (!result.ok) return jsonNoStore({ error: 'Check the text.', errors: result.errors }, 400);
  return jsonNoStore({ ok: true, version: result.version, unchanged: result.unchanged }, result.unchanged ? 200 : 201);
}

export const adminLegalRoute = { onRequestGet: read, onRequestPost: save };
