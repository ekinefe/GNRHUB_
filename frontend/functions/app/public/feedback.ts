// POST /api/feedback (GNR-148): the "Report a problem" form. Stored in D1, read in the admin panel.
import { receiveFeedback } from '../../domain/feedback/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { clientKey } from '../../infra/hourlyLimit.ts';
import { jsonNoStore, readJson, sameOrigin } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 6_000;

async function send({ request, env }: Context): Promise<Response> {
  const db = dbOf(env);
  if (!db) return jsonNoStore({ error: 'Reports are not available right now. Please email me instead.' }, 503);
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  const body = await readJson(request, MAX_BODY);
  if (body === undefined) return jsonNoStore({ error: 'That report is too long, or not sent as JSON.' }, 400);

  const result = await receiveFeedback(db, body, () => clientKey(request, env.SESSION_SECRET ?? 'gnrdigital-feedback', 'feedback'));
  if (result.ok) return jsonNoStore({ ok: true }, 201);
  if (result.reason === 'invalid') return jsonNoStore({ error: 'Check the form.', errors: result.errors }, 400);
  return jsonNoStore({ error: 'You sent several reports recently. Please try again later or email me.' }, 429, { 'Retry-After': String(result.wait) });
}

export const feedbackRoute = { onRequestPost: send };
