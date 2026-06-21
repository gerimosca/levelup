-- Migration: escudos de racha de la mascota (la mascota protege tu racha)
ALTER TABLE pet
  ADD COLUMN IF NOT EXISTS shields INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN pet.shields IS
  'Escudos de racha acumulados; la mascota los gasta para salvar tu racha si te saltas la misión principal.';
