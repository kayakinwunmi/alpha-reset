-- Migration 4: per-email send log.
-- Run this in your Supabase SQL Editor after supabase-migration-2.sql.
-- Safe to re-run (IF NOT EXISTS / conditional policies).
--
-- Records every email actually sent (welcome, returning, story, each drip,
-- approval, decline, broadcast) with an exact timestamp, so the admin
-- person-drawer can show a true engagement history instead of one
-- reconstructed from send state. Only captures emails sent AFTER it's applied;
-- older sends aren't backfillable.

CREATE TABLE IF NOT EXISTS ar_email_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid NOT NULL REFERENCES ar_signups(id) ON DELETE CASCADE,
  email text NOT NULL,                     -- recipient, denormalized for audit
  type text NOT NULL,                      -- welcome | returning | story | drip | approval | decline | broadcast
  subject text NOT NULL,
  session_id uuid REFERENCES ar_sessions(id) ON DELETE SET NULL,  -- for drip/approval/decline
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ar_email_log_person_idx ON ar_email_log (person_id, created_at DESC);

ALTER TABLE ar_email_log ENABLE ROW LEVEL SECURITY;

-- Append-only from the app (service role), same policy shape as ar_messages.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_log' AND policyname = 'Service role can insert'
  ) THEN
    CREATE POLICY "Service role can insert" ON ar_email_log FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ar_email_log' AND policyname = 'Service role can read'
  ) THEN
    CREATE POLICY "Service role can read" ON ar_email_log FOR SELECT USING (true);
  END IF;
END $$;
