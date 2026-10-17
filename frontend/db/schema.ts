// Single source of truth for the D1 schema (GNR-132).
// Flow: edit this file -> npm run db:generate -> review the SQL in db/migrations
// -> npm run db:migrate:local -> test -> commit -> only then db:migrate:remote.
// No launch feature reads or writes D1 yet, so there are no tables.
export {};
