-- Page views for the admin overview (GNR-82): one counter per day and page.
-- No address, no cookie, no referrer, no browser details, nothing about the visitor. Rows older than 90 days are deleted.
CREATE TABLE page_views (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
) WITHOUT ROWID;
