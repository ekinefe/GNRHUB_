// GET /api/admin/summary: what the admin home shows at a glance (ADR 0009): unread messages, posts by status, and the
// five newest messages and most recently edited posts (a short preview only, never a whole message or post body).
import { requireAdmin } from '../../app/admin/guard.ts';
import { postOverview } from '../../domain/posts/actions.ts';
import { type D1 } from '../../infra/d1.ts';
import { jsonNoStore } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

async function summary({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const db = env.DB as D1;
  const messages = await db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(read_at IS NULL), 0) AS unread FROM contact_messages').first<{ total: number; unread: number }>();
  const posts = await postOverview(db);
  const latestMessages = await db.prepare('SELECT id, name, subject, substr(message, 1, 90) AS preview, created_at AS createdAt, read_at IS NOT NULL AS read FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 5').all<{ id: number; name: string; subject: string; preview: string; createdAt: number; read: number }>();
  return jsonNoStore({
    messages: { total: messages?.total ?? 0, unread: messages?.unread ?? 0 },
    posts: posts.counts,
    recent: { messages: latestMessages.results.map((m) => ({ ...m, read: m.read === 1 })), posts: posts.recent },
  });
}

export const summaryRoute = { onRequestGet: summary };
