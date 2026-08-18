-- Migration 0001: Initial ops engine schema

-- Create ops_events table if not exists
CREATE TABLE IF NOT EXISTS public.ops_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    source text DEFAULT 'application',
    actor_type text DEFAULT 'system',
    actor_id text,
    payload jsonb DEFAULT '{}',
    dedupe_key text,
    status text DEFAULT 'pending',
    occurred_at timestamptz DEFAULT now(),
    processed_at timestamptz,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create ops_automation_runs table if not exists
CREATE TABLE IF NOT EXISTS public.ops_automation_runs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.ops_events(id) ON DELETE CASCADE,
    rule_id uuid,
    status text DEFAULT 'running',
    result jsonb DEFAULT '{}',
    started_at timestamptz DEFAULT now(),
    finished_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create ops_ai_actions table if not exists
CREATE TABLE IF NOT EXISTS public.ops_ai_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.ops_events(id) ON DELETE CASCADE,
    automation_run_id uuid REFERENCES public.ops_automation_runs(id) ON DELETE SET NULL,
    action_type text NOT NULL,
    title text NOT NULL,
    description text,
    rationale text,
    payload jsonb DEFAULT '{}',
    status text DEFAULT 'suggested',
    confidence integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create ops_approvals table if not exists
CREATE TABLE IF NOT EXISTS public.ops_approvals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action_id uuid REFERENCES public.ops_ai_actions(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    approved_by text,
    approved_at timestamptz,
    rejected_by text,
    rejected_at timestamptz,
    reason text,
    requested_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create ops_email_outbox table if not exists
CREATE TABLE IF NOT EXISTS public.ops_email_outbox (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email text NOT NULL,
    to_name text,
    subject text NOT NULL,
    html_body text,
    text_body text,
    email_type text DEFAULT 'general',
    source_type text,
    source_id text,
    scheduled_for timestamptz DEFAULT now(),
    sent_at timestamptz,
    status text DEFAULT 'queued',
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create job_alert_deliveries table if not exists
CREATE TABLE IF NOT EXISTS public.job_alert_deliveries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid,
    window_start timestamptz,
    window_end timestamptz,
    jobs_count integer DEFAULT 0,
    status text DEFAULT 'queued',
    email_outbox_id uuid REFERENCES public.ops_email_outbox(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create ops_audit_log table if not exists
CREATE TABLE IF NOT EXISTS public.ops_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_type text DEFAULT 'system',
    actor_id text,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ops_events_status_occurred_idx ON public.ops_events (status, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ops_events_event_type_idx ON public.ops_events (event_type);
CREATE INDEX IF NOT EXISTS ops_events_entity_type_idx ON public.ops_events (entity_type);
CREATE INDEX IF NOT EXISTS ops_automation_runs_event_id_idx ON public.ops_automation_runs (event_id);
CREATE INDEX IF NOT EXISTS ops_automation_runs_status_idx ON public.ops_automation_runs (status);
CREATE INDEX IF NOT EXISTS ops_ai_actions_event_id_idx ON public.ops_ai_actions (event_id);
CREATE INDEX IF NOT EXISTS ops_ai_actions_status_idx ON public.ops_ai_actions (status);
CREATE INDEX IF NOT EXISTS ops_approvals_action_id_idx ON public.ops_approvals (action_id);
CREATE INDEX IF NOT EXISTS ops_approvals_status_idx ON public.ops_approvals (status);
CREATE INDEX IF NOT EXISTS ops_email_outbox_status_scheduled_idx ON public.ops_email_outbox (status, scheduled_for);
CREATE INDEX IF NOT EXISTS job_alert_deliveries_subscription_id_idx ON public.job_alert_deliveries (subscription_id);
CREATE INDEX IF NOT EXISTS ops_audit_log_created_at_idx ON public.ops_audit_log (created_at DESC);