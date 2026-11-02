// POST /api/hit (GNR-82): the browser says which page was opened; the count goes up by one.
// Nothing about the visitor is read or stored. A browser that sends Do Not Track or Global Privacy Control is not counted.
// The answer is always 204 so the page never shows an error for a counter.
import { recordView } from '../../domain/analytics/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { readJson, sameOrigin } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

const MAX_BODY = 500;
const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

async function hit({ request, env }: Context): Promise<Response> {
  const db = dbOf(env);
  if (!db || !sameOrigin(request)) return done();
  if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') return done();
  const body = await readJson(request, MAX_BODY);
  try { await recordView(db, body); } catch { /* a counter must never break a page */ }
  return done();
}

export const hitRoute = { onRequestPost: hit };
