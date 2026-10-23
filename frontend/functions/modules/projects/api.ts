// Public list of the projects shown on Home, About and Portfolio (ADR 0012): GET /api/projects.
// Nothing here is private; it is the same text as the page. Empty until the owner adds projects in the admin panel.
type D1 = { prepare: (sql: string) => { all: <T>() => Promise<{ results: T[] }> } };
type Context = { request: Request; env: { DB?: unknown } };

type Row = {
  slug: string; grp: string; name: string; kind: string; summary: string; tech: string; points: string; status: string;
  repo: string | null; url: string | null; image: string | null; imageAlt: string; caseStudy: string | null; learned: string;
  featured: number; inAbout: number;
};

// Fixed column list, never built from request data.
export const COLUMNS = 'slug, grp, name, kind, summary, tech, points, status, repo, url, image, image_alt AS imageAlt, case_study AS caseStudy, learned, featured, in_about AS inAbout';

// Rows to the shape the pages use (id is the slug).
export const toProject = (r: Row) => ({
  id: r.slug,
  group: r.grp,
  name: r.name,
  kind: r.kind,
  summary: r.summary,
  tech: r.tech ? r.tech.split(',') : [],
  points: r.points ? r.points.split('\n') : [],
  status: r.status,
  repo: r.repo,
  url: r.url,
  ...(r.image ? { image: r.image, imageAlt: r.imageAlt } : {}),
  ...(r.caseStudy ? { caseStudy: r.caseStudy } : {}),
  ...(r.learned ? { learned: r.learned } : {}),
  featured: r.featured === 1,
  inAbout: r.inAbout === 1,
});

async function list({ env }: Context): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' };
  if (!env.DB) return new Response(JSON.stringify({ projects: [] }), { headers });
  const { results } = await (env.DB as D1).prepare('SELECT ' + COLUMNS + ' FROM projects ORDER BY sort, id').all<Row>();
  return new Response(JSON.stringify({ projects: results.map(toProject) }), { headers });
}

export const projectsRoute = { onRequestGet: list };
