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
  player_name   TEXT    NOT NULL DEFAULT 'Anonymous',
  wave          INTEGER NOT NULL,
  kills         INTEGER NOT NULL,
  difficulty_id TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_high_scores_wave ON high_scores (wave DESC);
