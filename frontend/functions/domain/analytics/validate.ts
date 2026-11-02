import { LIMITS } from './types.ts';

const PATH = /^\/[A-Za-z0-9._~\-/]*$/;
const PRIVATE_PREFIXES = ['/admin', '/api', '/r/'];

/** The page to count, or null when it should be ignored (not a path of this site, the admin area, or too odd). */
export function cleanPath(input: unknown): string | null {
  const raw = (input as { path?: unknown } | null)?.path;
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > LIMITS.path || !PATH.test(raw)) return null;
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') || '/' : raw;
  if (path.includes('//')) return null;
  if (PRIVATE_PREFIXES.some((p) => path === p.replace(/\/$/, '') || path.startsWith(p.endsWith('/') ? p : p + '/'))) return null;
  return path;
}
