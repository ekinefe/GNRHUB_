-- Portfolio projects managed in the admin panel (ADR 0012). The page falls back to the list built into the site
-- while this table is empty. tech is comma-separated, points is one point per line, booleans are 0 or 1.
-- grp: 'project' (the Projects list) or 'tool' (separate projects shown in their own block).
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  grp TEXT NOT NULL DEFAULT 'project' CHECK (grp IN ('project', 'tool')),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Web app',
  summary TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '',
  points TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'soon', 'paused')),
  repo TEXT,
  url TEXT,
  image TEXT,
  image_alt TEXT NOT NULL DEFAULT '',
  case_study TEXT,
  learned TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  in_about INTEGER NOT NULL DEFAULT 0 CHECK (in_about IN (0, 1)),
  sort INTEGER NOT NULL DEFAULT 100,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX projects_sort_idx ON projects (grp, sort, id);
