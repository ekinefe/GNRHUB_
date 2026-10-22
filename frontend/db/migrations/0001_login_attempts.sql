-- Failed admin sign-in attempts, counted per 15-minute window (ADR 0009).
-- key is a keyed hash of the client address (never the address itself), or '*' for all clients together.
CREATE TABLE login_attempts (
  key TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket)
);
