-- Migration 2: multi-session support — sessions, registrations, and backfill.
-- Run this in your Supabase SQL Editor AFTER supabase-migration.sql.
-- Safe to re-run: everything is IF NOT EXISTS / conditional, and the backfill
-- only runs when the June 2026 session hasn't been created yet.

-- 1. Sessions ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,                     -- e.g. "Q3 Reset", "Forest Retreat 2026"
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  kind text NOT NULL DEFAULT 'virtual',    -- 'virtual' | 'in_person'
  location text,                           -- for in-person sessions
  capacity int,                            -- display-only ("N places")
  notes text,                              -- public blurb, e.g. "Shared costs, details in the group"
  status text NOT NULL DEFAULT 'open',     -- 'draft' | 'open' | 'completed' | 'cancelled'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 2. Registrations (person <-> session) ---------------------------------------

CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed', -- 'confirmed' | 'requested' | 'declined'
  intention text,
  drip_stage int DEFAULT 0,                 -- 0 registered, 1 prep, 2 48h, 3-5 day 1-3, 6 complete
  last_drip_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (person_id, session_id)
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 3. Person-level story drip pointer ------------------------------------------
-- 0 = "why I started" not yet sent; 1 = sent. Story emails go once per person,
-- ever; the session countdown emails are tracked per registration instead.

ALTER TABLE signups ADD COLUMN IF NOT EXISTS story_stage int DEFAULT 0;

-- 4. RLS policies (service-role access, same pattern as the other tables) -----

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Service role can insert') THEN
    CREATE POLICY "Service role can insert" ON sessions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Service role can read') THEN
    CREATE POLICY "Service role can read" ON sessions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Service role can update') THEN
    CREATE POLICY "Service role can update" ON sessions FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Service role can delete') THEN
    CREATE POLICY "Service role can delete" ON sessions FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Service role can insert') THEN
    CREATE POLICY "Service role can insert" ON registrations FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Service role can read') THEN
    CREATE POLICY "Service role can read" ON registrations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Service role can update') THEN
    CREATE POLICY "Service role can update" ON registrations FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Service role can delete') THEN
    CREATE POLICY "Service role can delete" ON registrations FOR DELETE USING (true);
  END IF;
END $$;

-- 5. Backfill: June 2026 session + registrations for everyone already signed up.
-- Old signups.drip_stage meaning: 1 = "why" story email, 2-7 = session emails
-- (prep, 48h, day 1, day 2, day 3, congrats). New model:
--   signups.story_stage       = 1 if old stage >= 1
--   registrations.drip_stage  = old stage - 1 (capped 0..6)

DO $$
DECLARE
  june_session_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sessions WHERE starts_at = '2026-06-24T00:00:00Z') THEN
    INSERT INTO sessions (title, starts_at, ends_at, kind, status)
    VALUES ('Alpha Reset — June 2026', '2026-06-24T00:00:00Z', '2026-06-26T18:00:00Z', 'virtual', 'open')
    RETURNING id INTO june_session_id;

    INSERT INTO registrations (person_id, session_id, status, intention, drip_stage, last_drip_at)
    SELECT
      s.id,
      june_session_id,
      'confirmed',
      s.intention,
      GREATEST(LEAST(COALESCE(s.drip_stage, 0) - 1, 6), 0),
      s.last_drip_at
    FROM signups s
    ON CONFLICT (person_id, session_id) DO NOTHING;

    UPDATE signups SET story_stage = 1 WHERE COALESCE(drip_stage, 0) >= 1;
  END IF;
END $$;
