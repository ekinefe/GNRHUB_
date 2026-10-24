// Conversions between the shapes a project has: the pages use arrays, the admin form uses text, the API stores text.

// A built-in project (arrays) to form values, used by the import.
export const fromBuiltIn = (p, grp, sort) => ({
    name: p.name, slug: p.id, grp, kind: p.kind, summary: p.summary, tech: p.tech.join(', '), points: p.points.join('\n'), status: p.status,
    repo: p.repo ?? '', url: p.url ?? '', image: p.image ?? '', imageAlt: p.imageAlt ?? '', caseStudy: p.caseStudy ?? '', learned: p.learned ?? '',
    featured: Boolean(p.featured), inAbout: Boolean(p.inAbout), sort,
});

// A project from /api/admin/projects to form values (the API calls the group "group" and uses the slug as "id").
export const fromApi = (p) => ({ ...fromBuiltIn(p, p.group, p.sort), featured: p.featured, inAbout: p.inAbout });
