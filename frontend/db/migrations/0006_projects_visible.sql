-- Lets the owner hide a project without deleting it (GNR-159, ADR 0012). 1 = shown on the site, 0 = only in the admin panel.
ALTER TABLE projects ADD COLUMN visible INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1));
