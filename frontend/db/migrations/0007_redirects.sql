-- Short links the owner manages in the admin panel (GNR-147): /r/<slug> sends the visitor to target.
-- target is a https:// address or a path on this site. permanent = 1 answers 301, 0 answers 302.
-- clicks only counts visits: no address, no time, nothing about the visitor.
CREATE TABLE redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  target TEXT NOT NULL,
  permanent INTEGER NOT NULL DEFAULT 0 CHECK (permanent IN (0, 1)),
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
