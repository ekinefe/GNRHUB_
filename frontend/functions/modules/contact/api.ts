// Public contact form endpoint: POST /api/contact (ADR 0009). Stored in D1, read in the admin panel.
import { jsonNoStore, sameOrigin } from '../../_lib/adminGuard.ts';
import { contactClientKey, contactLockedFor, contactRecord } from '../../_lib/contactLimit.ts';
import { validateContact } from './validate.ts';

type D1 = Parameters<typeof contactLockedFor>[0];
type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 12_000;

async function send({ request, env }: Context): Promise<Response> {
  if (!env.DB) return jsonNoStore({ error: 'Messages are not available right now. Please email me instead.' }, 503);
  if (!sameOrigin(request)) return jsonNoStore({ error: 'Forbidden.' }, 403);
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return jsonNoStore({ error: 'That message is too long.' }, 413);

  const text = await request.text();
  if (text.length > MAX_BODY) return jsonNoStore({ error: 'That message is too long.' }, 413);
  let body: unknown;
  try { body = JSON.parse(text); } catch { return jsonNoStore({ error: 'Send the form as JSON.' }, 400); }

  // A hidden field real visitors never fill in. Bots do: answer as if it worked, store nothing.
  if (typeof (body as { website?: unknown })?.website === 'string' && (body as { website: string }).website.trim() !== '') {
    return jsonNoStore({ ok: true }, 201);
  }

  const result = validateContact(body);
  if (!result.ok) return jsonNoStore({ error: 'Check the form.', errors: result.errors }, 400);

  const db = env.DB as D1 & { prepare: (sql: string) => { bind: (...v: unknown[]) => { run: () => Promise<unknown> } } };
  const client = await contactClientKey(request, env.SESSION_SECRET);
  const wait = await contactLockedFor(db, client);
  if (wait > 0) return jsonNoStore({ error: 'You sent several messages recently. Please try again later or email me.' }, 429, { 'Retry-After': String(wait) });

  const { name, email, subject, message } = result.value;
  await contactRecord(db, client);
  await db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').bind(name, email, subject, message).run();
  return jsonNoStore({ ok: true }, 201);
}

export const contactRoute = { onRequestPost: send };
