// GET /api/status (GNR-126): the address an uptime monitor pings. Public, so it says only whether the site and its
// database answer: no secrets, no counts, no versions. 200 when fine, 503 when the database is bound but fails.
import { jsonNoStore } from '../../_lib/adminGuard.ts';

type D1 = { prepare: (sql: string) => { first: <T>() => Promise<T | null> } };
type Context = { request: Request; env: { DB?: unknown } };

export type Db = 'ok' | 'missing' | 'error';

export async function checkDb(binding: unknown): Promise<Db> {
  if (!binding) return 'missing';
  try {
    await (binding as D1).prepare('SELECT 1 AS up').first();
    return 'ok';
  } catch {
    return 'error';
  }
}

async function status({ env }: Context): Promise<Response> {
  const db = await checkDb(env.DB);
  return jsonNoStore({ ok: db !== 'error', db }, db === 'error' ? 503 : 200);
}

export const statusRoute = { onRequestGet: status };
