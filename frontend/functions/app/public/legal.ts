// GET /api/legal/:doc (GNR-161): the newest saved Privacy or Terms text, or 404 while none was saved (the page then
// shows the text that ships with the site).
import { publicLegal } from '../../domain/legal/actions.ts';
import { isDoc } from '../../domain/legal/types.ts';
import { dbOf } from '../../infra/d1.ts';
import { json } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

async function one({ request, env }: Context): Promise<Response> {
  const doc = new URL(request.url).pathname.split('/').pop();
  if (!isDoc(doc)) return json({ error: 'Not found.' }, 404);
  const db = dbOf(env);
  if (!db) return json({ error: 'Not available.' }, 503);
  const found = await publicLegal(db, doc);
  return found ? json({ document: found }, 200, { 'Cache-Control': 'public, max-age=60' }) : json({ error: 'Not found.' }, 404);
}

export const legalRoute = { onRequestGet: one };
