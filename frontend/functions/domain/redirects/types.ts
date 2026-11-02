// What a short link is (GNR-147): /r/<slug> goes to a https address or a page of this site.
export const LIMITS = { slug: 60, target: 300 };
export type RedirectInput = { slug: string; target: string; permanent: boolean };
export type RedirectResult = { ok: true; value: RedirectInput } | { ok: false; errors: Record<string, string> };
