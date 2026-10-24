// Portfolio projects in the admin panel (ADR 0012). Every handler starts with requireAdmin; changes also need the same origin.
//   GET  /api/admin/projects        list            POST /api/admin/projects       create
//   GET  /api/admin/projects/:id    one             POST /api/admin/projects/:id   { action: 'save', ...fields } or { action: 'delete' }
import { jsonNoStore, requireAdmin } from '../../_lib/adminGuard.ts';
import { validateProject } from '../projects/validate.ts';
import { COLUMNS, toProject } from '../projects/api.ts';

type D1 = {
  prepare: (sql: string) => {
    bind: (...v: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
      run: () => Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
    };
    all: <T>() => Promise<{ results: T[] }>;
  };
};
type Context = { request: Request; env: { DB?: unknown; SESSION_SECRET?: string } };

const MAX_BODY = 40_000;
const idOf = (request: Request) => Number(new URL(request.url).pathname.split('/').pop());
const taken = (e: unknown) => e instanceof Error && /UNIQUE/i.test(e.message);
const SLUG_TAKEN = { error: 'Check the project.', errors: { slug: 'That address is already used by another project.' } };
// The admin also needs the database id and the sort number, which the public list leaves out.
const withAdminFields = (r: Record<string, unknown>) => ({ ...toProject(r as never), dbId: r.id, sort: r.sort });
const ADMIN_COLUMNS = 'id, sort, ' + COLUMNS;

async function readJson(request: Request): Promise<unknown | undefined> {
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return undefined;
  const text = await request.text();
  if (text.length > MAX_BODY) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}

async function list({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const { results } = await (env.DB as D1).prepare('SELECT ' + ADMIN_COLUMNS + ' FROM projects ORDER BY grp, sort, id').all<Record<string, unknown>>();
  return jsonNoStore({ projects: results.map(withAdminFields) });
}

async function get({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env);
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const id = idOf(request);
  if (!Number.isInteger(id) || id < 1) return jsonNoStore({ error: 'Not found.' }, 404);
  const row = await (env.DB as D1).prepare('SELECT ' + ADMIN_COLUMNS + ' FROM projects WHERE id = ?').bind(id).first<Record<string, unknown>>();
  return row ? jsonNoStore({ project: withAdminFields(row) }) : jsonNoStore({ error: 'Not found.' }, 404);
}

async function create({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const result = validateProject(await readJson(request));
  if (!result.ok) return jsonNoStore({ error: 'Check the project.', errors: result.errors }, 400);
  const v = result.value;
  try {
    const run = await (env.DB as D1)
      .prepare('INSERT INTO projects (slug, grp, name, kind, summary, tech, points, status, repo, url, image, image_alt, case_study, learned, featured, in_about, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(v.slug, v.grp, v.name, v.kind, v.summary, v.tech.join(','), v.points.join('\n'), v.status, v.repo, v.url, v.image, v.imageAlt, v.caseStudy, v.learned, v.featured ? 1 : 0, v.inAbout ? 1 : 0, v.sort)
      .run();
    return jsonNoStore({ ok: true, id: run.meta?.last_row_id }, 201);
  } catch (e) {
    if (taken(e)) return jsonNoStore(SLUG_TAKEN, 409);
    throw e;
  }
}

async function change({ request, env }: Context): Promise<Response> {
  const guard = await requireAdmin(request, env, { changes: true });
  if (guard instanceof Response) return guard;
  if (!env.DB) return jsonNoStore({ error: 'The database is not available.' }, 503);
  const id = idOf(request);
  if (!Number.isInteger(id) || id < 1) return jsonNoStore({ error: 'Not found.' }, 404);
  const body = await readJson(request);
  const action = (body as { action?: unknown } | undefined)?.action;
  const db = env.DB as D1;

  if (action === 'delete') {
    const run = await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    return run.meta?.changes ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
  }
  if (action !== 'save') return jsonNoStore({ error: 'Unknown action.' }, 400);

  const result = validateProject(body);
  if (!result.ok) return jsonNoStore({ error: 'Check the project.', errors: result.errors }, 400);
  const v = result.value;
  try {
    const run = await db
      .prepare('UPDATE projects SET slug = ?, grp = ?, name = ?, kind = ?, summary = ?, tech = ?, points = ?, status = ?, repo = ?, url = ?, image = ?, image_alt = ?, case_study = ?, learned = ?, featured = ?, in_about = ?, sort = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(v.slug, v.grp, v.name, v.kind, v.summary, v.tech.join(','), v.points.join('\n'), v.status, v.repo, v.url, v.image, v.imageAlt, v.caseStudy, v.learned, v.featured ? 1 : 0, v.inAbout ? 1 : 0, v.sort, id)
      .run();
    return run.meta?.changes ? jsonNoStore({ ok: true }) : jsonNoStore({ error: 'Not found.' }, 404);
  } catch (e) {
    if (taken(e)) return jsonNoStore(SLUG_TAKEN, 409);
    throw e;
  }
}

export const adminProjectsRoute = { onRequestGet: list, onRequestPost: create };
export const adminProjectRoute = { onRequestGet: get, onRequestPost: change };
