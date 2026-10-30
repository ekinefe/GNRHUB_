// GET /api/admin/summary: what the admin home shows at a glance (ADR 0009): unread messages, posts by status, and the
// five newest messages and most recently edited posts (a short preview only, never a whole message or post body).
import { messageOverview } from '../../domain/messages/actions.ts';
import { postOverview } from '../../domain/posts/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { jsonNoStore } from '../../infra/http.ts';
import { requireAdmin } from './guard.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

async function summary({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  const db = dbOf(env);
  if (!db) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const messages = await messageOverview(db);
  const posts = await postOverview(db);
  return jsonNoStore({
    messages: { total: messages.total, unread: messages.unread },
    posts: posts.counts,
    recent: { messages: messages.recent, posts: posts.recent },
  });
}

export const summaryRoute = { onRequestGet: summary };
