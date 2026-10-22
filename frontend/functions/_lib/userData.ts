// Ownership rule for user data (GNR-63): D1 has no row-level security, so every
// query on user-owned rows takes the session user id and filters by it. Callers pass
// the id from the verified session, never one taken from the request body.
type D1 = {
  prepare: (sql: string) => {
    bind: (...v: unknown[]) => {
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
};

export type Preferences = { theme: string | null; language: string | null; data: unknown };

export async function getPreferences(db: D1, userId: string): Promise<Preferences | null> {
  const row = await db
    .prepare('SELECT theme, language, data FROM user_preferences WHERE user_id = ?')
    .bind(userId)
    .first<{ theme: string | null; language: string | null; data: string | null }>();
  return row ? { theme: row.theme, language: row.language, data: row.data ? JSON.parse(row.data) : null } : null;
}

export async function setPreferences(db: D1, userId: string, prefs: Partial<Preferences>): Promise<void> {
  await db
    .prepare(
      `INSERT INTO user_preferences (user_id, theme, language, data) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET theme = excluded.theme, language = excluded.language,
         data = excluded.data, updated_at = unixepoch()`,
    )
    .bind(userId, prefs.theme ?? null, prefs.language ?? null, prefs.data === undefined ? null : JSON.stringify(prefs.data))
    .run();
}
