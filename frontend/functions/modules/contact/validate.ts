// Checks a contact form submission (pure, no database). Returns clean values or one plain message per bad field.
export const LIMITS = { name: 100, email: 200, subject: 150, messageMin: 10, message: 5000 };

export type ContactInput = { name: string; email: string; subject: string; message: string };
export type ContactResult = { ok: true; value: ContactInput } | { ok: false; errors: Record<string, string> };

// Letters, digits and the usual punctuation, one @, a dot in the domain, no spaces. Not a full RFC check on purpose.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(CONTROL, '').trim() : '');

export function validateContact(body: unknown): ContactResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const value: ContactInput = { name: clean(b.name), email: clean(b.email), subject: clean(b.subject).replace(/\s+/g, ' '), message: clean(b.message) };
  const errors: Record<string, string> = {};

  if (!value.name) errors.name = 'Enter your name.';
  else if (value.name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!value.email) errors.email = 'Enter your email address so I can reply.';
  else if (value.email.length > LIMITS.email || !EMAIL.test(value.email)) errors.email = 'Enter a valid email address.';

  if (value.subject.length > LIMITS.subject) errors.subject = `Keep the subject under ${LIMITS.subject} characters.`;

  if (value.message.length < LIMITS.messageMin) errors.message = `Write at least ${LIMITS.messageMin} characters.`;
  else if (value.message.length > LIMITS.message) errors.message = `Keep the message under ${LIMITS.message} characters.`;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
