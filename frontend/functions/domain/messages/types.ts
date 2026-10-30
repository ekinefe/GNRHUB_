// What a contact message is (ADR 0009): limits and the shape the form is reduced to.
export const LIMITS = { name: 100, email: 200, subject: 150, messageMin: 10, message: 5000 };

export type ContactInput = { name: string; email: string; subject: string; message: string };
export type ContactResult = { ok: true; value: ContactInput } | { ok: false; errors: Record<string, string> };
