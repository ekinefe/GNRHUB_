// GET /api/admin/summary: what the admin home shows at a glance (ADR 0009): unread messages, posts by status, and the
// five newest messages and most recently edited posts (a short preview only, never a whole message or post body).
import { jsonNoStore, requireAdmin } from '../../_lib/adminGuard.ts';

type D1 = { prepare: (sql: string) => { first: <T>() => Promise<T | null>; all: <T>() => Promise<{ results: T[] }> } };
type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

async function summary({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const db = env.DB as D1;
  const messages = await db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(read_at IS NULL), 0) AS unread FROM contact_messages').first<{ total: number; unread: number }>();
  const { results } = await db.prepare('SELECT status, COUNT(*) AS n FROM posts GROUP BY status').all<{ status: string; n: number }>();
  const posts = { draft: 0, private: 0, public: 0 };
  for (const r of results) if (r.status in posts) posts[r.status as keyof typeof posts] = r.n;
  const latestMessages = await db.prepare('SELECT id, name, subject, substr(message, 1, 90) AS preview, created_at AS createdAt, read_at IS NOT NULL AS read FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 5').all<{ id: number; name: string; subject: string; preview: string; createdAt: number; read: number }>();
  const latestPosts = await db.prepare('SELECT id, title, status, updated_at AS updatedAt FROM posts ORDER BY updated_at DESC, id DESC LIMIT 5').all<{ id: number; title: string; status: string; updatedAt: number }>();
  return jsonNoStore({
    messages: { total: messages?.total ?? 0, unread: messages?.unread ?? 0 },
    posts,
    recent: { messages: latestMessages.results.map((m) => ({ ...m, read: m.read === 1 })), posts: latestPosts.results },
  });
}

export const summaryRoute = { onRequestGet: summary };
