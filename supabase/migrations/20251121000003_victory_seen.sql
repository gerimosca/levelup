-- Migration: marcar la cinemática de victoria como vista (por cuenta, no por dispositivo)
ALTER TABLE season_progress
  ADD COLUMN IF NOT EXISTS victory_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN season_progress.victory_seen_at IS
  'Cuándo el usuario vio la cinemática de victoria de la temporada (para no repetirla en ningún dispositivo).';
