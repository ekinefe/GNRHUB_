// Checks a blog post from the editor (pure, no database): clean values, or one plain message per bad field.
import { slugify, SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';

import { LIMITS, STATUSES, type PostInput, type PostResult, type Status } from './types.ts';

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const text = (v: unknown): string => (typeof v === 'string' ? v.replace(CONTROL, '') : '');

export function validatePost(body: unknown): PostResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const title = text(b.title).replace(/\s+/g, ' ').trim();
  if (!title) errors.title = 'Give the post a title.';
  else if (title.length > LIMITS.title) errors.title = `Keep the title under ${LIMITS.title} characters.`;

  const slug = text(b.slug).trim() || slugify(title, LIMITS.slug);
  if (!slug || !SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug) errors.slug = 'Use lower-case letters, digits and single hyphens (for example my-first-post).';

  const summary = text(b.summary).replace(/\s+/g, ' ').trim();
  if (summary.length > LIMITS.summary) errors.summary = `Keep the summary under ${LIMITS.summary} characters.`;

  const content = text(b.body).replace(/\r\n?/g, '\n');
  if (content.length > LIMITS.body) errors.body = `Keep the post under ${LIMITS.body} characters.`;

  const tagList = [...new Set(text(b.tags).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (tagList.length > LIMITS.tags) errors.tags = `Use at most ${LIMITS.tags} tags.`;
  else if (tagList.some((t) => t.length > LIMITS.tag || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t))) errors.tags = 'Tags are lower-case words with letters, digits and hyphens, separated by commas.';

  const status = typeof b.status === 'string' && (STATUSES as readonly string[]).includes(b.status) ? (b.status as Status) : null;
  if (!status) errors.status = 'Choose draft, private or public.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, slug, summary, body: content, tags: tagList.join(','), status: status as Status } };
}
