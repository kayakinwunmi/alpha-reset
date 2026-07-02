-- Run this in your Supabase SQL Editor (fresh setup only).
-- All Alpha Reset tables are prefixed "ar_" so the Supabase project can be
-- shared with other apps without name collisions.
CREATE TABLE ar_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ar_signups ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role only (API route uses service key)
CREATE POLICY "Service role can insert" ON ar_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read" ON ar_signups
  FOR SELECT USING (true);
