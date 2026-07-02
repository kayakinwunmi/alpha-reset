-- Migration: signup intention, drip tracking, and broadcast log.
-- Run this in your Supabase SQL Editor after supabase-schema.sql
-- (safe to re-run — everything is IF NOT EXISTS / conditional).
--
-- NOTE: if your database still has the old unprefixed table names
-- (signups, messages, ...), run supabase-migration-3.sql FIRST to rename
-- them to the ar_ prefixed names used below.

-- 1. Signup upgrades ---------------------------------------------------------

-- Optional "What do you want from these 72 hours?" answer from the signup form.
ALTER TABLE ar_signups ADD COLUMN IF NOT EXISTS intention text;

-- Drip sequence tracking (the /api/drip cron already expects these).
ALTER TABLE ar_signups ADD COLUMN IF NOT EXISTS drip_stage int DEFAULT 0;
ALTER TABLE ar_signups ADD COLUMN IF NOT EXISTS last_drip_at timestamptz;

-- Phone is now optional on the form.
ALTER TABLE ar_signups ALTER COLUMN phone DROP NOT NULL;

-- 2. Broadcast log ------------------------------------------------------------
-- Every message sent from the admin dashboard is recorded here.

CREATE TABLE IF NOT EXISTS ar_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_count int NOT NULL DEFAULT 0,
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ar_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ar_messages' AND policyname = 'Service role can insert'
  ) THEN
    CREATE POLICY "Service role can insert" ON ar_messages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ar_messages' AND policyname = 'Service role can read'
  ) THEN
    CREATE POLICY "Service role can read" ON ar_messages FOR SELECT USING (true);
  END IF;
END $$;
