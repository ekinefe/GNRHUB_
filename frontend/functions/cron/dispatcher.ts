// One cron trigger, many jobs (GNR-151). wrangler.jsonc fires scheduled() every 15 minutes;
// each job says how often it wants to run and the dispatcher picks the due ones from the
// scheduled time. Adding a job means adding it to JOBS: no new trigger.
// Jobs must be idempotent. Each run is time-boxed, logged, and recorded in cron_runs.
type D1 = {
  prepare: (sql: string) => { bind: (...v: unknown[]) => { run: () => Promise<unknown> } };
};
export type CronEnv = { DB?: unknown };

export type Cadence = 'every-trigger' | 'hourly' | 'daily';
export type Job = { name: string; cadence: Cadence; timeoutMs?: number; run: (env: CronEnv, now: Date) => Promise<void> };

const DEFAULT_TIMEOUT_MS = 10_000;
const TRIGGER_MINUTES = 15; // keep in sync with the cron expression in wrangler.jsonc
const DAILY_HOUR_UTC = 3;

export function isDue(cadence: Cadence, when: Date): boolean {
  const firstSlot = when.getUTCMinutes() < TRIGGER_MINUTES;
  if (cadence === 'every-trigger') return true;
  if (cadence === 'hourly') return firstSlot;
  return firstSlot && when.getUTCHours() === DAILY_HOUR_UTC;
}

const sweep = (sql: string, ...params: unknown[]): Job['run'] => async (env) => {
  await (env.DB as D1).prepare(sql).bind(...params).run();
};

// Retention jobs: keep only what is useful.
export const JOBS: Job[] = [
  {
    name: 'rate-limit-retention',
    cadence: 'hourly',
    run: (env, now) => sweep('DELETE FROM rate_limit_hits WHERE bucket < ?', Math.floor(now.getTime() / 60_000) - 10)(env, now),
  },
  {
    name: 'audit-retention',
    cadence: 'daily',
    run: (env, now) =>
      sweep('DELETE FROM audit_log WHERE created_at < ?', Math.floor(now.getTime() / 1000) - 180 * 86_400)(env, now),
  },
];

const withTimeout = <T>(work: Promise<T>, ms: number, name: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${name} timed out after ${ms} ms`)), ms);
    work.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });

export async function runDue(env: CronEnv, scheduledTime: number, jobs: Job[] = JOBS): Promise<void> {
  const when = new Date(scheduledTime);
  for (const job of jobs.filter((j) => isDue(j.cadence, when))) {
    const started = Date.now();
    let error: string | null = null;
    try {
      await withTimeout(job.run(env, when), job.timeoutMs ?? DEFAULT_TIMEOUT_MS, job.name);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    const duration = Date.now() - started;
    if (error) console.error(`cron ${job.name} failed in ${duration} ms: ${error}`);
    else console.log(`cron ${job.name} ok in ${duration} ms`);
    await record(env, job.name, started, duration, error);
  }
}

async function record(env: CronEnv, name: string, started: number, duration: number, error: string | null) {
  try {
    await (env.DB as D1)
      .prepare(
        `INSERT INTO cron_runs (job, started_at, duration_ms, ok, error) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(job) DO UPDATE SET started_at = excluded.started_at, duration_ms = excluded.duration_ms,
           ok = excluded.ok, error = excluded.error`,
      )
      .bind(name, Math.floor(started / 1000), duration, error ? 0 : 1, error)
      .run();
  } catch (e) {
    console.error(`cron could not record ${name}:`, e);
  }
}
