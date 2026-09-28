alter table public.job_content
  add column if not exists publication_status text not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists review_notes text;

alter table public.job_content
  drop constraint if exists job_content_publication_status_check;

alter table public.job_content
  add constraint job_content_publication_status_check
  check (publication_status in ('draft','published','unpublished'));

create index if not exists idx_job_content_publication_status
  on public.job_content(publication_status);

create index if not exists idx_job_content_review_queue
  on public.job_content(quality_status, publication_status);
