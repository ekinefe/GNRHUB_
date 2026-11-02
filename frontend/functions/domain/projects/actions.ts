// What can be done with projects (ADR 0012). Plain functions: a database and plain values in, a plain result out.
// Nothing here knows about Request or Response; app/ turns a result into an answer.
import { type D1 } from '../../infra/d1.ts';
import { toAdminProject, toProject } from './present.ts';
import { allRows, countAll, deleteRow, findRow, insertRow, slugTaken, updateRow, visibleRows } from './repository.ts';
import { validateProject } from './validate.ts';

export type SaveResult =
  | { ok: true; id?: number }
  | { ok: false; reason: 'invalid'; errors: Record<string, string> }
  | { ok: false; reason: 'slug-taken' }
  | { ok: false; reason: 'not-found' };

/** What Home, About and Portfolio show. `managed` is true once the owner has any project, hidden ones included. */
export async function publicProjects(db: D1 | null) {
  if (!db) return { projects: [], managed: false };
  const rows = await visibleRows(db);
  return { projects: rows.map(toProject), managed: (await countAll(db)) > 0 };
}

export async function adminProjects(db: D1) {
  return (await allRows(db)).map(toAdminProject);
}

export async function adminProject(db: D1, id: number) {
  const row = await findRow(db, id);
  return row ? toAdminProject(row) : null;
}

export async function createProject(db: D1, input: unknown): Promise<SaveResult> {
  const result = validateProject(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return { ok: true, id: await insertRow(db, result.value) };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export async function saveProject(db: D1, id: number, input: unknown): Promise<SaveResult> {
  const result = validateProject(input);
  if (!result.ok) return { ok: false, reason: 'invalid', errors: result.errors };
  try {
    return (await updateRow(db, id, result.value)) ? { ok: true } : { ok: false, reason: 'not-found' };
  } catch (e) {
    if (slugTaken(e)) return { ok: false, reason: 'slug-taken' };
    throw e;
  }
}

export const deleteProject = (db: D1, id: number): Promise<boolean> => deleteRow(db, id);
