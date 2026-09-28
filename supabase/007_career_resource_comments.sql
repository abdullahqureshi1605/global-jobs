-- Horizon Jobs
-- Migration 007: Career resource comments
-- Public submissions remain pending until approved by an administrator.

BEGIN;

CREATE TABLE IF NOT EXISTS public.career_resource_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.career_resources(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_resource_comments_resource
  ON public.career_resource_comments(resource_id);

CREATE INDEX IF NOT EXISTS idx_career_resource_comments_status
  ON public.career_resource_comments(status);

CREATE INDEX IF NOT EXISTS idx_career_resource_comments_resource_status
  ON public.career_resource_comments(resource_id, status);

ALTER TABLE public.career_resource_comments
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_resource_comments"
  ON public.career_resource_comments;

CREATE POLICY "public_read_approved_resource_comments"
  ON public.career_resource_comments
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1
      FROM public.career_resources
      WHERE public.career_resources.id = career_resource_comments.resource_id
        AND public.career_resources.published_at IS NOT NULL
        AND public.career_resources.published_at <= now()
    )
  );

DROP POLICY IF EXISTS "public_submit_resource_comments"
  ON public.career_resource_comments;

CREATE POLICY "public_submit_resource_comments"
  ON public.career_resource_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.career_resources
      WHERE public.career_resources.id = career_resource_comments.resource_id
        AND public.career_resources.published_at IS NOT NULL
        AND public.career_resources.published_at <= now()
    )
  );

COMMIT;
