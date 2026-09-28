-- Horizon Jobs
-- Database verification
--
-- Run this AFTER schema.sql, 001_rls_and_indexes.sql and
-- 002_reference_seed.sql have been executed successfully.

SELECT
  'TABLE_COUNT' AS check_name,
  count(*) AS result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'categories',
    'countries',
    'profiles',
    'companies',
    'company_members',
    'jobs',
    'applications',
    'saved_jobs',
    'job_alerts',
    'career_resources',
    'ai_agents',
    'ai_agent_actions',
    'adzuna_import_runs',
    'adsense_config',
    'adsense_page_status',
    'seo_reports',
    'sitemaps',
    'maintenance_incidents',
    'notifications'
  );

SELECT
  'COUNTRIES' AS check_name,
  count(*) AS result
FROM public.countries;

SELECT
  'CATEGORIES' AS check_name,
  count(*) AS result
FROM public.categories;

SELECT
  'PUBLISHED_JOBS' AS check_name,
  count(*) AS result
FROM public.jobs
WHERE status = 'published';

SELECT
  'RLS_TABLES' AS check_name,
  count(*) AS result
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relrowsecurity = true
  AND c.relname IN (
    'categories',
    'countries',
    'profiles',
    'companies',
    'company_members',
    'jobs',
    'applications',
    'saved_jobs',
    'job_alerts',
    'career_resources',
    'ai_agents',
    'ai_agent_actions',
    'adzuna_import_runs',
    'adsense_config',
    'adsense_page_status',
    'seo_reports',
    'sitemaps',
    'maintenance_incidents',
    'notifications'
  );

SELECT
  'JOBS_SOURCE_COUNTS' AS check_name,
  source,
  count(*) AS result
FROM public.jobs
GROUP BY source
ORDER BY source;

SELECT
  'ADZUNA_IMPORT_RUNS' AS check_name,
  count(*) AS result
FROM public.adzuna_import_runs;
