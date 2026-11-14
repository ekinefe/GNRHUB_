// What can be done with page counts (GNR-82). Plain functions; app/ turns the results into answers.
import { type D1 } from '../../infra/d1.ts';
import { bump, hasPath, pathsOn, perDay, prune, topPaths } from './repository.ts';
import { LIMITS } from './types.ts';
import { cleanPath } from './validate.ts';

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const daysBefore = (ms: number, n: number) => dayOf(ms - n * 86_400_000);

export type RecordResult = 'counted' | 'ignored';

/**
 * Count one opening of a page. Anything that is not a plain page of this site is ignored, and so is a new page once a
 * day already holds too many different ones, so junk cannot grow the table. Old days are removed now and then.
 */
export async function recordView(db: D1, body: unknown, now = Date.now(), pruneChance = 0.02): Promise<RecordResult> {
  const path = cleanPath(body);
  if (!path) return 'ignored';
  const day = dayOf(now);
  if (!(await hasPath(db, day, path)) && (await pathsOn(db, day)) >= LIMITS.pathsPerDay) return 'ignored';
  await bump(db, day, path);
  if (Math.random() < pruneChance) await prune(db, daysBefore(now, LIMITS.keepDays));
  return 'counted';
}

/** The last 30 days (days without visits count as 0) and the most opened pages in that time. */
export async function analyticsOverview(db: D1, now = Date.now()) {
  const since = daysBefore(now, LIMITS.window - 1);
  const found = new Map((await perDay(db, since)).map((d) => [d.day, d.views]));
  const days = Array.from({ length: LIMITS.window }, (_, i) => {
    const day = daysBefore(now, LIMITS.window - 1 - i);
    return { day, views: found.get(day) ?? 0 };
  });
  return { days, total: days.reduce((n, d) => n + d.views, 0), top: await topPaths(db, since, LIMITS.top) };
}
