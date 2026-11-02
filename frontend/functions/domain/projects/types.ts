// What a portfolio project is (ADR 0012): the limits, the allowed values and the shape the admin form is reduced to.
export const LIMITS = { name: 80, slug: 60, kind: 30, summary: 300, tech: 10, techItem: 30, points: 6, point: 300, url: 300, imageAlt: 200, learned: 300 };
export const GROUPS = ['project', 'tool'] as const;
export const STATUSES = ['live', 'soon', 'paused'] as const;
export type ProjectInput = {
  slug: string; grp: (typeof GROUPS)[number]; name: string; kind: string; summary: string; tech: string[]; points: string[];
  status: (typeof STATUSES)[number]; repo: string | null; url: string | null; image: string | null; imageAlt: string;
  caseStudy: string | null; learned: string; featured: boolean; inAbout: boolean; visible: boolean; sort: number;
};
export type ProjectResult = { ok: true; value: ProjectInput } | { ok: false; errors: Record<string, string> };
