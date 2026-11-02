// Privacy and Terms as versioned documents (GNR-161): a plain-language summary and a Markdown body.
export const DOCS = ['privacy', 'terms'] as const;
export type Doc = (typeof DOCS)[number];
export const isDoc = (v: unknown): v is Doc => (DOCS as readonly unknown[]).includes(v);
export const LIMITS = { summaryMin: 20, summary: 500, bodyMin: 100, body: 30_000, versionsShown: 50 };

export type LegalInput = { summary: string; body: string };
export type LegalResult = { ok: true; value: LegalInput } | { ok: false; errors: Record<string, string> };
