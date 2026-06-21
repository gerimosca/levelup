-- Migration: ajustes de economía del usuario (dinero ahorrado)
-- Description: precio por cerveza y cervezas/día para estimar el dinero ahorrado.

ALTER TABLE player_state
  ADD COLUMN IF NOT EXISTS beer_price NUMERIC NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS beers_per_day NUMERIC NOT NULL DEFAULT 3;

COMMENT ON COLUMN player_state.beer_price IS 'Precio por cerveza (€) configurado por el usuario.';
COMMENT ON COLUMN player_state.beers_per_day IS 'Cervezas/día que el usuario solía beber.';
