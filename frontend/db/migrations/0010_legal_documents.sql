-- Versioned Privacy and Terms text edited in the admin panel (GNR-161).
-- Every save adds a new version and old ones stay as history. The public pages show the newest version; until the
-- first save, they show the text that ships with the site.
CREATE TABLE legal_documents (
  doc TEXT NOT NULL CHECK (doc IN ('privacy', 'terms')),
  version INTEGER NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (doc, version)
) WITHOUT ROWID;
