// What a blog post is (ADR 0009): limits, the three states and the shape the editor is reduced to.
// draft: only in the admin. private: in the admin, not on the site. public: on the site, in the feed and the sitemap.
export const LIMITS = { title: 150, slug: 80, summary: 300, body: 50_000, tags: 8, tag: 30 };
export const STATUSES = ['draft', 'private', 'public'] as const;
export type Status = (typeof STATUSES)[number];
export type PostInput = { title: string; slug: string; summary: string; body: string; tags: string; status: Status };
export type PostResult = { ok: true; value: PostInput } | { ok: false; errors: Record<string, string> };
