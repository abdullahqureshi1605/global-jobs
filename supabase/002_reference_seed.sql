-- Horizon Jobs
-- Migration 002: reference data only.
--
-- This intentionally does NOT insert fake jobs, fake companies,
-- fake users, fake applications, or fake AI actions.
--
-- Countries/categories are structural reference data and are safe
-- to establish before real provider ingestion.

BEGIN;

INSERT INTO public.countries (name, code)
VALUES
  ('Pakistan', 'PK'),
  ('India', 'IN'),
  ('Philippines', 'PH'),
  ('United Arab Emirates', 'AE'),
  ('Saudi Arabia', 'SA'),
  ('United Kingdom', 'GB'),
  ('United States', 'US'),
  ('Canada', 'CA'),
  ('Australia', 'AU'),
  ('Germany', 'DE'),
  ('France', 'FR'),
  ('Singapore', 'SG'),
  ('Malaysia', 'MY')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

INSERT INTO public.categories (name, slug, icon)
VALUES
  ('Information Technology', 'information-technology', '💻'),
  ('Software Development', 'software-development', '🧑‍💻'),
  ('Data & Analytics', 'data-analytics', '📊'),
  ('Design & Creative', 'design-creative', '🎨'),
  ('Marketing', 'marketing', '📣'),
  ('Sales', 'sales', '💼'),
  ('Finance & Accounting', 'finance-accounting', '💰'),
  ('Human Resources', 'human-resources', '👥'),
  ('Customer Service', 'customer-service', '🎧'),
  ('Engineering', 'engineering', '⚙️'),
  ('Healthcare', 'healthcare', '🏥'),
  ('Education', 'education', '🎓'),
  ('Administration', 'administration', '📋'),
  ('Legal', 'legal', '⚖️'),
  ('Operations', 'operations', '🏢')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon;

INSERT INTO public.adsense_config (
  id,
  site_wide_enabled,
  ads_txt_verified,
  min_word_count
)
VALUES (
  1,
  false,
  false,
  250
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
