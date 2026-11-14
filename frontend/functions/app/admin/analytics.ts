// GET /api/admin/analytics (GNR-82): page views for the last 30 days and the most opened pages.
import { analyticsOverview } from '../../domain/analytics/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { jsonNoStore } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

async function overview({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  return db ? jsonNoStore(await analyticsOverview(db)) : jsonNoStore({ error: 'The database is not available.' }, 503);
}

export const analyticsRoute = { onRequestGet: overview };
