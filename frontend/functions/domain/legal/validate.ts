import { LIMITS, type LegalResult } from './types.ts';

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').replace(CONTROL, '').trim() : '');

export function validateLegal(input: unknown): LegalResult {
  const b = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const summary = clean(b.summary).replace(/\s+/g, ' ');
  const body = clean(b.body);
  const errors: Record<string, string> = {};
  if (summary.length < LIMITS.summaryMin) errors.summary = `Write a plain-language summary of at least ${LIMITS.summaryMin} characters.`;
  else if (summary.length > LIMITS.summary) errors.summary = `Keep the summary under ${LIMITS.summary} characters.`;
  if (body.length < LIMITS.bodyMin) errors.body = `Write at least ${LIMITS.bodyMin} characters.`;
  else if (body.length > LIMITS.body) errors.body = `Keep the text under ${LIMITS.body} characters.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { summary, body } };
}
