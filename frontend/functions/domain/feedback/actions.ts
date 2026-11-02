// What can be done with feedback (GNR-148). Plain functions; app/ turns the results into answers.
import { type D1 } from '../../infra/d1.ts';
import { hourlyLimit } from '../../infra/hourlyLimit.ts';
import { toFeedback } from './present.ts';
import { deleteRow, insertRow, listRows, markRead, markUnread } from './repository.ts';
import { LIMITS } from './types.ts';
import { validateFeedback } from './validate.ts';

const LIST_LIMIT = 200;
const limit = hourlyLimit('feedback_hits', LIMITS.perClient, LIMITS.global);

export type SendResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> }
  | { ok: false; reason: 'limited'; wait: number };

/** A visitor's report. `client` is the hashed address for the rate limit. A filled hidden "website" field marks a bot: answered as if it worked, nothing stored. */
export async function receiveFeedback(db: D1, body: unknown, client: () => Promise<string>): Promise<SendResult> {
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === 'string' && trap.trim() !== '') return { ok: true };

  const result = validateFeedback(body);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };

  const key = await client();
  const wait = await limit.lockedFor(db, key);
  if (wait > 0) return { ok: false, reason: 'limited', wait };

  await limit.record(db, key);
  await insertRow(db, result.value);
  return { ok: true };
}

export async function adminFeedback(db: D1) {
  const rows = await listRows(db, LIST_LIMIT);
  return { feedback: rows.map(toFeedback), unread: rows.filter((f) => f.readAt === null).length };
}

export type ChangeResult = 'ok' | 'not-found' | 'unknown-action';

/** action is 'read', 'unread' or 'delete'. */
export async function changeFeedback(db: D1, id: number, action: unknown): Promise<ChangeResult> {
  let done: boolean;
  if (action === 'read') done = await markRead(db, id);
  else if (action === 'unread') done = await markUnread(db, id);
  else if (action === 'delete') done = await deleteRow(db, id);
  else return 'unknown-action';
  return done ? 'ok' : 'not-found';
}
