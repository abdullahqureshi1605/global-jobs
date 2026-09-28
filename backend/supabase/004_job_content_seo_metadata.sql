-- Horizon Jobs
-- Migration 004: SEO metadata for processed job content
--
-- This migration adds dedicated SEO fields generated during the
-- existing Gemini processing pass, before review/publication.
--
-- No existing job content is deleted or changed.

BEGIN;

ALTER TABLE public.job_content
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_job_content_seo_keywords
  ON public.job_content USING gin (seo_keywords);

COMMIT;
