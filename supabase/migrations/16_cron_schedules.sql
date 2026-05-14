-- Cron schedules for the 3 service-role edge functions.
--
-- Each scheduled command POSTs the matching edge function with an
-- x-cron-secret header. The header value is read inline from
-- vault.decrypted_secrets (Supabase Vault), so the literal secret never
-- lives in this migration's git history. The same secret is set in
-- Edge Function Secrets (CRON_SECRET env var) so functions can compare.
--
-- Schedules:
--   clean-expired-availability  */15 * * * *  (every 15 min)
--   expire-castings             0 * * * *     (top of every hour)
--   send-reengagement           0 14 * * *    (14:00 UTC = 11:00 BRT, 10:00 EDT)
--
-- Idempotent: unschedules by name first, then schedules. Safe to re-run.

-- ── clean-expired-availability ─────────────────────────────────────
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'clean-expired-availability';

SELECT cron.schedule(
  'clean-expired-availability',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ogilgnvspwjvbvjdrxvw.supabase.co/functions/v1/clean-expired-availability',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── expire-castings ────────────────────────────────────────────────
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'expire-castings';

SELECT cron.schedule(
  'expire-castings',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ogilgnvspwjvbvjdrxvw.supabase.co/functions/v1/expire-castings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── send-reengagement ──────────────────────────────────────────────
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'send-reengagement';

SELECT cron.schedule(
  'send-reengagement',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ogilgnvspwjvbvjdrxvw.supabase.co/functions/v1/send-reengagement',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
