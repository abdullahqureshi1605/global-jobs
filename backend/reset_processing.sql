UPDATE public.adzuna_raw_jobs
SET
  processing_status = 'pending',
  processing_error = NULL,
  updated_at = NOW()
WHERE id IN (
  SELECT raw_job_id
  FROM public.job_content
);
