-- Feedback and problem reports from the site's report form (GNR-148), read in the admin panel.
-- email is optional: it is stored only when the visitor chose to give it, to reply.
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('problem', 'idea', 'other')),
  page TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read_at INTEGER
);
CREATE INDEX feedback_created_idx ON feedback (created_at);

-- Reports sent per hour, to stop spam (same shape as contact_hits).
CREATE TABLE feedback_hits (
  key TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket)
);
