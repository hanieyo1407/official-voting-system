-- 006_add_election_schedule.sql
-- Adds authoritative election schedule table and seeds Students' Org 2025 schedule
-- Idempotent: safe to run multiple times, updates seed if values change

-- Create the table if missing
CREATE TABLE IF NOT EXISTS election_schedule (
  id SERIAL PRIMARY KEY,
  election_key TEXT NOT NULL UNIQUE DEFAULT 'students_2025',
  start_date TIMESTAMPTZ NOT NULL,       -- voting start (UTC)
  end_date TIMESTAMPTZ NOT NULL,         -- voting end (UTC)
  results_announcement TIMESTAMPTZ NULL, -- official results publish time (UTC)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by INTEGER NULL                -- admin id who last changed schedule
);

-- Keep a small index for lookups by key (idempotent)
CREATE INDEX IF NOT EXISTS idx_election_schedule_key ON election_schedule (election_key);

-- Upsert the authoritative Students' Org 2025 row
-- UTC times derived from the electoral calendar you provided:
--   Voting start  : 2025-11-22T06:00:00.000Z  (08:00 CAT)
--   Voting end    : 2025-11-22T13:30:00.000Z  (15:30 CAT)
--   Results announce: 2025-11-22T14:00:00.000Z (16:00 CAT)

INSERT INTO election_schedule (election_key, start_date, end_date, results_announcement, created_at, updated_at)
VALUES (
  'students_2025',
  '2025-11-22T06:00:00.000Z',
  '2025-11-22T13:30:00.000Z',
  '2025-11-22T14:00:00.000Z',
  now(),
  now()
)
ON CONFLICT (election_key) DO UPDATE
  SET start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      results_announcement = EXCLUDED.results_announcement,
      updated_at = now();

