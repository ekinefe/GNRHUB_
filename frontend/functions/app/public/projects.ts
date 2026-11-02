// Public list of the projects shown on Home, About and Portfolio (ADR 0012): GET /api/projects.
// Nothing here is private; it is the same text as the page. Empty until the owner adds projects in the admin panel.
import { publicProjects } from '../../domain/projects/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { json } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

async function list({ env }: Context): Promise<Response> {
  return json(await publicProjects(dbOf(env)), 200, { 'Cache-Control': 'public, max-age=30' });
}

export const projectsRoute = { onRequestGet: list };
