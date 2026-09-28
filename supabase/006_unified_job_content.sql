BEGIN;

ALTER TABLE public.job_content
  ADD COLUMN IF NOT EXISTS responsibilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS additional_information text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS application_job_id uuid;

CREATE INDEX IF NOT EXISTS idx_job_content_application_job_id
  ON public.job_content(application_job_id);

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS responsibilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS additional_information text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quality_score numeric,
  ADD COLUMN IF NOT EXISTS originality_score numeric,
  ADD COLUMN IF NOT EXISTS content_value_score numeric,
  ADD COLUMN IF NOT EXISTS source_coverage_score numeric,
  ADD COLUMN IF NOT EXISTS policy_safety_score numeric,
  ADD COLUMN IF NOT EXISTS ai_processing_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ai_processed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_jobs_seo_keywords
  ON public.jobs USING gin (seo_keywords);

CREATE OR REPLACE FUNCTION public.sync_manual_job_publication()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_job_id IS NOT NULL
     AND COALESCE(NEW.source, '') = 'manual' THEN

    UPDATE public.jobs
    SET
      status =
        CASE
          WHEN NEW.publication_status = 'published'
               AND NEW.quality_status = 'approved'
            THEN 'published'
          WHEN NEW.quality_status = 'rejected'
            THEN 'rejected'
          ELSE 'pending_review'
        END,
      published_at =
        CASE
          WHEN NEW.publication_status = 'published'
               AND NEW.quality_status = 'approved'
            THEN COALESCE(NEW.published_at, now())
          ELSE NULL
        END,
      updated_at = now()
    WHERE id = NEW.application_job_id;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_manual_job_publication
ON public.job_content;

CREATE TRIGGER trg_sync_manual_job_publication
AFTER INSERT OR UPDATE OF quality_status, publication_status, published_at
ON public.job_content
FOR EACH ROW
EXECUTE FUNCTION public.sync_manual_job_publication();

COMMIT;
