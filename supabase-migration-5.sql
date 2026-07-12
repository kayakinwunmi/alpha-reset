-- Migration 5: editable email templates.
-- Run this in your Supabase SQL Editor. Safe to re-run.
--
-- Stores admin OVERRIDES for the automated emails (the drip sequence + the
-- transactional ones). The code in lib/email-templates.ts holds the default
-- subject/body for every email; a row here overrides one by slug. "Reset to
-- default" simply deletes the row. Bodies use {{token}} placeholders that are
-- substituted per send (e.g. {{name}}, {{dates}}).

CREATE TABLE IF NOT EXISTS ar_email_templates (
  slug text PRIMARY KEY,          -- e.g. 'story-1', 'session-1'..'session-6', 'welcome', 'returning', 'approval', 'decline'
  subject text NOT NULL,
  body text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ar_email_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_templates' AND policyname = 'Service role can insert') THEN
    CREATE POLICY "Service role can insert" ON ar_email_templates FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_templates' AND policyname = 'Service role can read') THEN
    CREATE POLICY "Service role can read" ON ar_email_templates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_templates' AND policyname = 'Service role can update') THEN
    CREATE POLICY "Service role can update" ON ar_email_templates FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_templates' AND policyname = 'Service role can delete') THEN
    CREATE POLICY "Service role can delete" ON ar_email_templates FOR DELETE USING (true);
  END IF;
END $$;
