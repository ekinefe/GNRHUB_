// Single source of truth for the D1 schema (GNR-132, GNR-63).
// Flow: edit this file -> npm run db:generate -> review the SQL in db/migrations
// -> npm run db:migrate:local -> test -> commit -> only then db:migrate:remote.
//
// D1 has no row-level security. Every query on user-owned data must filter by the
// session user id, admin reads go through audited admin endpoints, and both rules
// are enforced in code and tested against testD1 (functions/_test/testD1.js).
import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const now = sql`(unixepoch())`;

// --- Better Auth core tables (field names follow its defaults) ---------------------

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  // additionalFields
  username: text('username').unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('accounts_user_idx').on(t.userId)],
);

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
});

// --- Access control ----------------------------------------------------------------

// Deliberately separate from users: a user row can never grant itself admin.
export const adminUsers = sqliteTable('admin_users', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'owner'] }).notNull().default('admin'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
});

// Runtime switches for product modules (mirrors modules/registry.js).
export const modules = sqliteTable('modules', {
  key: text('key').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  minAccess: text('min_access', { enum: ['public', 'user', 'granted', 'admin'] }).notNull().default('user'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
});

// Per-person grants for modules whose minimum access is "granted".
export const moduleAccess = sqliteTable(
  'module_access',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    moduleKey: text('module_key').notNull().references(() => modules.key, { onDelete: 'cascade' }),
    grantedAt: integer('granted_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [primaryKey({ columns: [t.userId, t.moduleKey] })],
);

// --- Operations --------------------------------------------------------------------

// key = route + salted SHA-256 of the IP (never the raw IP), bucket = minute. See GNR-133.
export const rateLimitHits = sqliteTable(
  'rate_limit_hits',
  {
    key: text('key').notNull(),
    bucket: integer('bucket').notNull(),
    count: integer('count').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.key, t.bucket] })],
);

// Append-only trail of admin reads and writes.
export const auditLog = sqliteTable(
  'audit_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    target: text('target'),
    detail: text('detail', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('audit_log_actor_idx').on(t.actorId), index('audit_log_created_idx').on(t.createdAt)],
);

// Last run of each scheduled job, so cron failures are visible (GNR-151).
export const cronRuns = sqliteTable('cron_runs', {
  job: text('job').primaryKey(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  durationMs: integer('duration_ms').notNull(),
  ok: integer('ok', { mode: 'boolean' }).notNull(),
  error: text('error'),
});

// --- User-owned data (always filter by the session user id) -------------------------

export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme'),
  language: text('language'),
  data: text('data', { mode: 'json' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
});

export const consents = sqliteTable(
  'consents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    version: text('version').notNull(),
    granted: integer('granted', { mode: 'boolean' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('consents_user_idx').on(t.userId)],
);
