// What can be done with contact messages (ADR 0009). Plain functions; app/ turns the results into answers.
import { type D1 } from '../../infra/d1.ts';
import { contactLockedFor, contactRecord } from './limit.ts';
import { toMessage, toRecent } from './present.ts';
import { deleteRow, insertRow, listRows, markRead, markUnread, recentRows, totals } from './repository.ts';
import { validateContact } from './validate.ts';

const LIST_LIMIT = 200;
const RECENT = 5;

export type ReceiveResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> }
  | { ok: false; reason: 'limited'; wait: number };

/**
 * A visitor's message. `client` is the hashed address used for the rate limit (see limit.ts).
 * A hidden "website" field that real visitors never fill in marks a bot: it is answered as if it worked and nothing is stored.
 */
export async function receiveMessage(db: D1, body: unknown, client: () => Promise<string>): Promise<ReceiveResult> {
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === 'string' && trap.trim() !== '') return { ok: true };

  const result = validateContact(body);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };

  const key = await client();
  const wait = await contactLockedFor(db, key);
  if (wait > 0) return { ok: false, reason: 'limited', wait };

  await contactRecord(db, key);
  await insertRow(db, result.value);
  return { ok: true };
}

export async function adminMessages(db: D1) {
  const rows = await listRows(db, LIST_LIMIT);
  return { messages: rows.map(toMessage), unread: rows.filter((m) => m.readAt === null).length };
}

export type ChangeResult = 'ok' | 'not-found' | 'unknown-action';

/** action is 'read', 'unread' or 'delete'. */
export async function changeMessage(db: D1, id: number, action: unknown): Promise<ChangeResult> {
  let done: boolean;
  if (action === 'read') done = await markRead(db, id);
  else if (action === 'unread') done = await markUnread(db, id);
  else if (action === 'delete') done = await deleteRow(db, id);
  else return 'unknown-action';
  return done ? 'ok' : 'not-found';
}

/** Counts and the newest few, for the admin overview. */
export async function messageOverview(db: D1) {
  return { ...(await totals(db)), recent: (await recentRows(db, RECENT)).map(toRecent) };
}
