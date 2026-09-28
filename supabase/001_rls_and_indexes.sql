-- Horizon Jobs
-- Migration 001: indexes + Row Level Security
-- Execute only after schema.sql has been successfully created.
--
-- IMPORTANT:
-- This migration does not create fake jobs or fake users.
-- Public users may read published job content only.
-- Authenticated users receive ownership-based access where appropriate.
-- Admin write policies will be added with the admin/security batch.

BEGIN;

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_jobs_status_posted_at
  ON public.jobs (status, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_country_id
  ON public.jobs (country_id);

CREATE INDEX IF NOT EXISTS idx_jobs_category_id
  ON public.jobs (category_id);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id
  ON public.jobs (company_id);

CREATE INDEX IF NOT EXISTS idx_jobs_source_external_id
  ON public.jobs (source, external_id);

CREATE INDEX IF NOT EXISTS idx_jobs_slug
  ON public.jobs (slug);

CREATE INDEX IF NOT EXISTS idx_companies_slug
  ON public.companies (slug);

CREATE INDEX IF NOT EXISTS idx_countries_code
  ON public.countries (code);

CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON public.categories (slug);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id
  ON public.applications (candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
  ON public.applications (job_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id
  ON public.saved_jobs (candidate_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id
  ON public.saved_jobs (job_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_adzuna_import_runs_started_at
  ON public.adzuna_import_runs (started_at DESC);

-- Prevent duplicate source jobs when the provider gives the same
-- external identifier more than once.
CREATE UNIQUE INDEX IF NOT EXISTS uq_jobs_source_external_id
  ON public.jobs (source, external_id)
  WHERE external_id IS NOT NULL;

-- Prevent a candidate from saving the same job multiple times.
CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_jobs_candidate_job
  ON public.saved_jobs (candidate_id, job_id);

-- Prevent duplicate company membership records.
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_members_company_user
  ON public.company_members (company_id, user_id);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adzuna_import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsense_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsense_page_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitemaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC REFERENCE DATA
-- ============================================================

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;

CREATE POLICY "public_read_categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_read_countries" ON public.countries;

CREATE POLICY "public_read_countries"
ON public.countries
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================
-- PUBLIC PUBLISHED JOBS
-- ============================================================

DROP POLICY IF EXISTS "public_read_published_jobs" ON public.jobs;

CREATE POLICY "public_read_published_jobs"
ON public.jobs
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- ============================================================
-- PUBLIC COMPANY INFORMATION USED BY PUBLISHED JOBS
-- ============================================================

DROP POLICY IF EXISTS "public_read_job_companies" ON public.companies;

CREATE POLICY "public_read_job_companies"
ON public.companies
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE public.jobs.company_id = public.companies.id
      AND public.jobs.status = 'published'
  )
);

-- ============================================================
-- CANDIDATE PROFILE
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;

CREATE POLICY "users_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;

CREATE POLICY "users_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- COMPANY MEMBERSHIP
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_company_memberships"
ON public.company_members;

CREATE POLICY "users_read_own_company_memberships"
ON public.company_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- APPLICATIONS
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_applications"
ON public.applications;

CREATE POLICY "users_read_own_applications"
ON public.applications
FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_applications"
ON public.applications;

CREATE POLICY "users_create_own_applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_applications"
ON public.applications;

CREATE POLICY "users_update_own_applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

-- ============================================================
-- SAVED JOBS
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_saved_jobs"
ON public.saved_jobs;

CREATE POLICY "users_read_own_saved_jobs"
ON public.saved_jobs
FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_saved_jobs"
ON public.saved_jobs;

CREATE POLICY "users_create_own_saved_jobs"
ON public.saved_jobs
FOR INSERT
TO authenticated
WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_saved_jobs"
ON public.saved_jobs;

CREATE POLICY "users_delete_own_saved_jobs"
ON public.saved_jobs
FOR DELETE
TO authenticated
USING (candidate_id = auth.uid());

-- ============================================================
-- JOB ALERTS
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_job_alerts"
ON public.job_alerts;

CREATE POLICY "users_read_own_job_alerts"
ON public.job_alerts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_job_alerts"
ON public.job_alerts;

CREATE POLICY "users_create_own_job_alerts"
ON public.job_alerts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_job_alerts"
ON public.job_alerts;

CREATE POLICY "users_update_own_job_alerts"
ON public.job_alerts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_job_alerts"
ON public.job_alerts;

CREATE POLICY "users_delete_own_job_alerts"
ON public.job_alerts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

DROP POLICY IF EXISTS "users_read_own_notifications"
ON public.notifications;

CREATE POLICY "users_read_own_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_notifications"
ON public.notifications;

CREATE POLICY "users_update_own_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- PUBLIC CAREER RESOURCES
-- ============================================================

DROP POLICY IF EXISTS "public_read_career_resources"
ON public.career_resources;

CREATE POLICY "public_read_career_resources"
ON public.career_resources
FOR SELECT
TO anon, authenticated
USING (published_at IS NOT NULL AND published_at <= now());

COMMIT;
