-- Migration: hábitos activos del jugador (onboarding "elige tu camino")
-- Description: los objetivos que el usuario elige; vacío = aún sin onboarding.

ALTER TABLE player_state
  ADD COLUMN IF NOT EXISTS active_habits TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN player_state.active_habits IS
  'Hábitos elegidos por el usuario en el onboarding. Vacío = onboarding pendiente.';
