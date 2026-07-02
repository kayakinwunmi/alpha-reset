-- Migration 3: prefix all tables with "ar_" so this app can share the
-- Supabase project with other apps without name collisions.
--
-- For databases created BEFORE the prefix change: renames each existing
-- table, preserving all data, constraints, foreign keys, and RLS policies.
-- Fresh databases (set up from the rewritten schema/migration files) already
-- use the prefixed names, so this file just no-ops.
--
-- Idempotent: each rename only runs if the old name exists and the new one
-- doesn't. Run it BEFORE deploying the code that reads the ar_ names.

DO $$
BEGIN
  IF to_regclass('public.signups') IS NOT NULL AND to_regclass('public.ar_signups') IS NULL THEN
    ALTER TABLE signups RENAME TO ar_signups;
  END IF;

  IF to_regclass('public.messages') IS NOT NULL AND to_regclass('public.ar_messages') IS NULL THEN
    ALTER TABLE messages RENAME TO ar_messages;
  END IF;

  IF to_regclass('public.sessions') IS NOT NULL AND to_regclass('public.ar_sessions') IS NULL THEN
    ALTER TABLE sessions RENAME TO ar_sessions;
  END IF;

  IF to_regclass('public.registrations') IS NOT NULL AND to_regclass('public.ar_registrations') IS NULL THEN
    ALTER TABLE registrations RENAME TO ar_registrations;
  END IF;
END $$;
