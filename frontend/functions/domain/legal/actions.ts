// What can be done with the legal texts (GNR-161). Plain functions; app/ turns the results into answers.
import { type D1 } from '../../infra/d1.ts';
import { addVersion, byVersion, newest, versions } from './repository.ts';
import { LIMITS, type Doc } from './types.ts';
import { validateLegal } from './validate.ts';

/** The text the public page shows, or null while no version has been saved (the page then uses the built-in text). */
export async function publicLegal(db: D1, doc: Doc) {
  const row = await newest(db, doc);
  return row ? { doc, ...row } : null;
}

/** For the editor: one version (the newest unless `version` is given) and the list of all versions. */
export async function adminLegal(db: D1, doc: Doc, version?: number) {
  const current = version ? await byVersion(db, doc, version) : await newest(db, doc);
  return { doc, current, versions: await versions(db, doc, LIMITS.versionsShown) };
}

export type SaveResult =
  | { ok: true; version: number; unchanged: boolean }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> };

/** Saves a new version. Text identical to the newest version adds nothing, so a double click does not make history noise. */
export async function saveLegal(db: D1, doc: Doc, input: unknown): Promise<SaveResult> {
  const result = validateLegal(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  const last = await newest(db, doc);
  if (last && last.summary === result.value.summary && last.body === result.value.body) return { ok: true, version: last.version, unchanged: true };
  return { ok: true, version: await addVersion(db, doc, result.value), unchanged: false };
}
