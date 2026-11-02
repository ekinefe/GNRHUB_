-- Messages sent through the contact form (ADR 0009), read in the admin panel.
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read_at INTEGER
);
CREATE INDEX contact_messages_created_idx ON contact_messages (created_at);

-- Messages sent per hour, to stop spam. key is a keyed hash of the client address, or '*' for everyone together.
CREATE TABLE contact_hits (
  key TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket)
);
