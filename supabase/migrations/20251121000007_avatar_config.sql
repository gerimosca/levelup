-- Fase E: configuración visual del avatar (tono de piel + color de pelo).
-- Almacenado en player_state para no tocar la tabla auth.users/profiles.
ALTER TABLE player_state
  ADD COLUMN IF NOT EXISTS avatar_config JSONB NOT NULL DEFAULT '{}';
