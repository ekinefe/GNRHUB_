// Checks a feedback form (pure, no database). Returns clean values or one plain message per bad field.
import { KINDS, LIMITS, type FeedbackResult, type Kind } from './types.ts';

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PAGE = /^\/[A-Za-z0-9._~\-/]*$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(CONTROL, '').trim() : '');

export function validateFeedback(body: unknown): FeedbackResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const kind = clean(b.kind) || 'problem';
  const page = clean(b.page);
  const email = clean(b.email);
  const message = clean(b.message);
  const errors: Record<string, string> = {};

  if (!(KINDS as readonly string[]).includes(kind)) errors.kind = 'Choose what this is about.';
  // The page is a convenience, not something to refuse a report for: an odd value is just dropped.
  const safePage = page.length <= LIMITS.page && PAGE.test(page) ? page : '';
  if (email && (email.length > LIMITS.email || !EMAIL.test(email))) errors.email = 'Enter a valid email address, or leave it empty.';
  if (message.length < LIMITS.messageMin) errors.message = `Write at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { kind: kind as Kind, page: safePage, message, email } };
}
