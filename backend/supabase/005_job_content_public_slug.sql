BEGIN;

ALTER TABLE public.job_content
  ADD COLUMN IF NOT EXISTS public_slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_content_public_slug
  ON public.job_content(public_slug)
  WHERE public_slug IS NOT NULL;

COMMIT;
