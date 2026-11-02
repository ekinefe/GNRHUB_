// What can be done with short links (GNR-147). Plain functions; app/ turns the results into answers.
import { type D1 } from '../../infra/d1.ts';
import { toAdminRedirect } from './present.ts';
import { allRows, countVisit, deleteRow, findBySlug, findRow, insertRow, slugTaken, updateRow } from './repository.ts';
import { validateRedirect } from './validate.ts';

export type SaveResult =
  | { ok: true; id?: number }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> }
  | { ok: false; reason: 'slug-taken' }
  | { ok: false; reason: 'not-found' };

/** Where /r/<slug> goes, or null. The visit is counted; a failed count never stops the redirect. */
export async function followRedirect(db: D1, slug: string): Promise<{ target: string; permanent: boolean } | null> {
  const row = await findBySlug(db, slug);
  if (!row) return null;
  try { await countVisit(db, slug); } catch { /* the counter is a nicety */ }
  return { target: row.target, permanent: row.permanent === 1 };
}

export async function adminRedirects(db: D1) {
  return (await allRows(db)).map(toAdminRedirect);
}

export async function adminRedirect(db: D1, id: number) {
  const row = await findRow(db, id);
  return row ? toAdminRedirect(row) : null;
}

export async function createRedirect(db: D1, input: unknown): Promise<SaveResult> {
  const result = validateRedirect(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return { ok: true, id: await insertRow(db, result.value) };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export async function saveRedirect(db: D1, id: number, input: unknown): Promise<SaveResult> {
  const result = validateRedirect(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return (await updateRow(db, id, result.value)) ? { ok: true } : { ok: false, reason: 'not-found' };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export const deleteRedirect = (db: D1, id: number): Promise<boolean> => deleteRow(db, id);
