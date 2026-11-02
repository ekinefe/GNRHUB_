// All SQL for page_views (GNR-82).
import { type D1 } from '../../infra/d1.ts';
import { type DayCount, type PageCount } from './types.ts';

export async function pathsOn(db: D1, day: string): Promise<number> {
  return (await db.prepare('SELECT COUNT(*) AS n FROM page_views WHERE day = ?').bind(day).first<{ n: number }>())?.n ?? 0;
}

export async function hasPath(db: D1, day: string, path: string): Promise<boolean> {
  return !!(await db.prepare('SELECT 1 AS x FROM page_views WHERE day = ? AND path = ?').bind(day, path).first());
}

export async function bump(db: D1, day: string, path: string): Promise<void> {
  await db.prepare('INSERT INTO page_views (day, path, views) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET views = views + 1').bind(day, path).run();
}

export async function prune(db: D1, before: string): Promise<void> {
  await db.prepare('DELETE FROM page_views WHERE day < ?').bind(before).run();
}

export async function perDay(db: D1, since: string): Promise<DayCount[]> {
  return (await db.prepare('SELECT day, SUM(views) AS views FROM page_views WHERE day >= ? GROUP BY day ORDER BY day').bind(since).all<DayCount>()).results;
}

export async function topPaths(db: D1, since: string, limit: number): Promise<PageCount[]> {
  return (await db.prepare('SELECT path, SUM(views) AS views FROM page_views WHERE day >= ? GROUP BY path ORDER BY views DESC, path LIMIT ?').bind(since, limit).all<PageCount>()).results;
}
