// The one D1 shape the Worker code needs, so handlers and repositories do not each declare their own.
// A real D1Database satisfies it; the tests use functions/_test/testD1.js.
export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
};
export type D1 = { prepare: (sql: string) => D1Statement };

/** The binding from `env.DB`, or null while the database does not exist yet. */
export const dbOf = (env: { DB?: unknown }): D1 | null => (env.DB ? (env.DB as D1) : null);

export type DbState = 'ok' | 'missing' | 'error';

/** Whether the database answers a trivial query: 'missing' when it is not bound yet, 'error' when it is bound but fails. */
export async function checkDb(binding: unknown): Promise<DbState> {
  if (!binding) return 'missing';
  try {
    await (binding as D1).prepare('SELECT 1 AS up').first();
    return 'ok';
  } catch {
    return 'error';
  }
}
