CREATE TABLE `cron_runs` (
	`job` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`ok` integer NOT NULL,
	`error` text
);
