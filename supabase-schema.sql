-- Run this in your Supabase SQL Editor
CREATE TABLE signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role only (API route uses service key)
CREATE POLICY "Service role can insert" ON signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read" ON signups
  FOR SELECT USING (true);
