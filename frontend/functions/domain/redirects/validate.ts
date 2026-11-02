// Checks a short link from the admin form (pure, no database): clean values, or one plain message per bad field.
import { SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';
import { LIMITS, type RedirectInput, type RedirectResult } from './types.ts';

// A page of this site: starts with one slash, then path characters. No "//" (that would be another site), no spaces.
const SITE_PATH = /^\/(?!\/)[A-Za-z0-9._~\-/?=&#%]*$/;

// Only https links: never javascript:, data: or http:.
function httpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch { return false; }
}

export function validateRedirect(body: unknown): RedirectResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  if (!slug || !SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug) errors.slug = 'Use lower-case letters, digits and single hyphens (for example cv).';

  const target = typeof b.target === 'string' ? b.target.trim() : '';
  if (!target) errors.target = 'Enter where the link goes.';
  else if (target.length > LIMITS.target) errors.target = `Keep the address under ${LIMITS.target} characters.`;
  else if (!httpsUrl(target) && !SITE_PATH.test(target)) errors.target = 'Use a full https:// address, or a page of this site such as /about.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { slug, target: target as RedirectInput['target'], permanent: b.permanent === true } };
}
