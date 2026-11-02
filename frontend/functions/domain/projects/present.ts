// The shapes sent to the browser: what the pages use, and what the admin form also needs.
import { type AdminRow, type Row } from './repository.ts';

/** A row as the pages use it (id is the slug). */
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

// The admin also needs the database id, the sort number and the visibility, which the public list leaves out.
export const toAdminProject = (r: AdminRow) => ({ ...toProject(r), dbId: r.id, sort: r.sort, visible: r.visible === 1 });
