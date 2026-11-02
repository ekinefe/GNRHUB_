// GET /api/status (GNR-126): the address an uptime monitor pings. Public, so it says only whether the site and its
// database answer: no secrets, no counts, no versions. 200 when fine, 503 when the database is bound but fails.
import { checkDb } from '../../infra/d1.ts';
import { jsonNoStore } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

async function status({ env }: Context): Promise<Response> {
  const db = await checkDb(env.DB);
  return jsonNoStore({ ok: db !== 'error', db }, db === 'error' ? 503 : 200);
}

export const statusRoute = { onRequestGet: status };
