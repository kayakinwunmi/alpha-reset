-- Migration: signup intention, drip tracking, and broadcast log.
-- Run this in your Supabase SQL Editor (safe to re-run — everything is IF NOT EXISTS / conditional).

-- 1. Signup upgrades ---------------------------------------------------------

-- Optional "What do you want from these 72 hours?" answer from the signup form.
ALTER TABLE signups ADD COLUMN IF NOT EXISTS intention text;

-- Drip sequence tracking (the /api/drip cron already expects these).
ALTER TABLE signups ADD COLUMN IF NOT EXISTS drip_stage int DEFAULT 0;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS last_drip_at timestamptz;

-- Phone is now optional on the form.
ALTER TABLE signups ALTER COLUMN phone DROP NOT NULL;

-- 2. Broadcast log ------------------------------------------------------------
-- Every message sent from the admin dashboard is recorded here.

CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_count int NOT NULL DEFAULT 0,
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Service role can insert'
  ) THEN
    CREATE POLICY "Service role can insert" ON messages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Service role can read'
  ) THEN
    CREATE POLICY "Service role can read" ON messages FOR SELECT USING (true);
  END IF;
END $$;
