// Public contact form endpoint: POST /api/contact (ADR 0009). Stored in D1, read in the admin panel.
import { receiveMessage } from '../../domain/messages/actions.ts';
import { contactClientKey } from '../../domain/messages/limit.ts';
import { dbOf } from '../../infra/d1.ts';
import { jsonNoStore, sameOrigin } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 12_000;

async function send({ request, env }: Context): Promise<Response> {
  const db = dbOf(env);
  if (!db) return jsonNoStore({ error: 'Messages are not available right now. Please email me instead.' }, 503);
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return jsonNoStore({ error: 'That message is too long.' }, 413);

  const text = await request.text();
  if (text.length > MAX_BODY) return jsonNoStore({ error: 'That message is too long.' }, 413);
  let body: unknown;
  try { body = JSON.parse(text); } catch { return jsonNoStore({ error: 'Send the form as JSON.' }, 400); }

  const result = await receiveMessage(db, body, () => contactClientKey(request, env.SESSION_SECRET));
  if (result.ok) return jsonNoStore({ ok: true }, 201);
  if (result.reason === 'invalid') return jsonNoStore({ error: 'Check the form.', errors: result.errors }, 400);
  return jsonNoStore({ error: 'You sent several messages recently. Please try again later or email me.' }, 429, { 'Retry-After': String(result.wait) });
}

export const contactRoute = { onRequestPost: send };
