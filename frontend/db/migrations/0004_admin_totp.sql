-- The newest two-factor step accepted for the admin, so a code cannot be used twice (ADR 0010). One row.
CREATE TABLE admin_totp (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_step INTEGER NOT NULL
);
