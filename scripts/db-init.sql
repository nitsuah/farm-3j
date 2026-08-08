-- Run this once against your Neon database to set up the farm-3j schema.
-- psql $DATABASE_URL -f scripts/db-init.sql

CREATE TABLE IF NOT EXISTS game_saves (
  id          SERIAL PRIMARY KEY,
  device_id   TEXT    NOT NULL,
  slot        INTEGER NOT NULL CHECK (slot IN (0, 1, 2)),
  data        JSONB   NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (device_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_game_saves_device ON game_saves (device_id);

CREATE TABLE IF NOT EXISTS high_scores (
  id            SERIAL PRIMARY KEY,
  device_id     TEXT    NOT NULL,
  wave          INTEGER NOT NULL,
  kills         INTEGER NOT NULL,
  result        TEXT    NOT NULL DEFAULT 'defeat',
  gold          INTEGER NOT NULL DEFAULT 0,
  time_seconds  INTEGER NOT NULL DEFAULT 0,
  score_date    TEXT    NOT NULL DEFAULT '',
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration block for databases created before the schema change:
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'high_scores' AND column_name = 'result'
  ) THEN
    ALTER TABLE high_scores DROP COLUMN IF EXISTS player_name;
    ALTER TABLE high_scores DROP COLUMN IF EXISTS difficulty_id;
    ALTER TABLE high_scores ADD COLUMN result       TEXT    NOT NULL DEFAULT 'defeat';
    ALTER TABLE high_scores ADD COLUMN gold         INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE high_scores ADD COLUMN time_seconds INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE high_scores ADD COLUMN score_date   TEXT    NOT NULL DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_high_scores_wave ON high_scores (wave DESC);
