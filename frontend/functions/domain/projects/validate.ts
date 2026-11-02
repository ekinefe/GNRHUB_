// Checks a project from the admin form (pure, no database): clean values, or one plain message per bad field.
import { slugify, SLUG_PATTERN } from '../../../src/shared/lib/slugify.js';
import { LIMITS, GROUPS, STATUSES, type ProjectInput, type ProjectResult } from './types.ts';

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const text = (v: unknown): string => (typeof v === 'string' ? v.replace(CONTROL, '') : '');
const oneLine = (v: unknown) => text(v).replace(/\s+/g, ' ').trim();

// Only https links: never javascript:, data: or http:.
function httpsUrl(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.toString() : null;
  } catch { return null; }
}

export function validateProject(body: unknown): ProjectResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = oneLine(b.name);
  if (!name) errors.name = 'Give the project a name.';
  else if (name.length > LIMITS.name) errors.name = `Keep the name under ${LIMITS.name} characters.`;

  const slug = text(b.slug).trim() || slugify(name, LIMITS.slug);
  if (!slug || !SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug) errors.slug = 'Use lower-case letters, digits and single hyphens (for example planned-lost).';

  const grp = typeof b.grp === 'string' && (GROUPS as readonly string[]).includes(b.grp) ? (b.grp as ProjectInput['grp']) : null;
  if (!grp) errors.grp = 'Choose project or tool.';

  const kind = oneLine(b.kind);
  if (!kind || kind.length > LIMITS.kind) errors.kind = `Give a short kind, such as Web app (under ${LIMITS.kind} characters).`;

  const summary = oneLine(b.summary);
  if (!summary) errors.summary = 'Write one sentence about the project.';
  else if (summary.length > LIMITS.summary) errors.summary = `Keep the summary under ${LIMITS.summary} characters.`;

  const tech = [...new Set(text(b.tech).split(',').map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean))];
  if (tech.length > LIMITS.tech) errors.tech = `Use at most ${LIMITS.tech} technologies.`;
  else if (tech.some((t) => t.length > LIMITS.techItem)) errors.tech = `Keep each technology under ${LIMITS.techItem} characters.`;

  const points = text(b.points).replace(/\r\n?/g, '\n').split('\n').map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (points.length > LIMITS.points) errors.points = `Use at most ${LIMITS.points} points, one per line.`;
  else if (points.some((p) => p.length > LIMITS.point)) errors.points = `Keep each point under ${LIMITS.point} characters.`;

  const status = typeof b.status === 'string' && (STATUSES as readonly string[]).includes(b.status) ? (b.status as ProjectInput['status']) : null;
  if (!status) errors.status = 'Choose live, soon or paused.';

  const link = (field: 'repo' | 'url'): string | null => {
    const raw = text(b[field]).trim();
    if (!raw) return null;
    const ok = raw.length <= LIMITS.url ? httpsUrl(raw) : null;
    if (!ok) errors[field] = 'Use a full https:// address, or leave it empty.';
    return ok;
  };
  const repo = link('repo');
  const url = link('url');

  const imageRaw = text(b.image).trim();
  const imageOk = /^\/projects\/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|avif|svg)$/i.test(imageRaw);
  if (imageRaw && !imageOk) errors.image = 'Use a file already in the site, such as /projects/my-project.png, or leave it empty.';
  const image = imageRaw && imageOk ? imageRaw : null;
  const imageAlt = oneLine(b.imageAlt);
  if (imageAlt.length > LIMITS.imageAlt) errors.imageAlt = `Keep the image description under ${LIMITS.imageAlt} characters.`;
  else if (image && !imageAlt) errors.imageAlt = 'Describe the image for people who cannot see it.';

  const caseRaw = text(b.caseStudy).trim();
  if (caseRaw && !/^\/[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/i.test(caseRaw)) errors.caseStudy = 'Use a page of this site, such as /colophon, or leave it empty.';

  const learned = oneLine(b.learned);
  if (learned.length > LIMITS.learned) errors.learned = `Keep it under ${LIMITS.learned} characters.`;

  const sortNum = b.sort === undefined || b.sort === '' || b.sort === null ? 100 : Number(b.sort);
  if (!Number.isInteger(sortNum) || sortNum < 0 || sortNum > 9999) errors.sort = 'Use a whole number from 0 to 9999; smaller comes first.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      slug, grp: grp as ProjectInput['grp'], name, kind, summary, tech, points, status: status as ProjectInput['status'], repo, url, image, imageAlt,
      caseStudy: caseRaw || null, learned, featured: b.featured === true, inAbout: b.inAbout === true, visible: b.visible !== false, sort: sortNum,
    },
  };
}
