// What a piece of feedback is (GNR-148): a short report about a problem, an idea or anything else, with the page it was about.
export const KINDS = ['problem', 'idea', 'other'] as const;
export type Kind = (typeof KINDS)[number];
export const LIMITS = { page: 120, email: 200, messageMin: 10, message: 2000, perClient: 3, global: 30 };

export type FeedbackInput = { kind: Kind; page: string; message: string; email: string };
export type FeedbackResult = { ok: true; value: FeedbackInput } | { ok: false; errors: Record<string, string> };
