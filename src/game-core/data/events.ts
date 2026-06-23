/**
 * Pool de eventos diarios. Siempre POSITIVOS (bonus), nunca penalizaciones.
 * Ver docs/design/02-game-design.md §9.
 *
 * Eventos con target.kind === 'habit' solo se ofrecen cuando ese hábito está activo
 * (filtrado en eligibleEvents). Así nunca aparece un bonus a un hábito que el usuario
 * no está trabajando ese día.
 */
import type { EventDef } from '../types';

export const EVENTS: EventDef[] = [
  // --- Eventos contextuales (condicionados) ---
  {
    key: 'rematch_day',
    multiplier: 2,
    target: { kind: 'enemy' },
    weight: 14,
    onlyAfterRelapse: true,
  },
  {
    key: 'weekend_temptation',
    multiplier: 3,
    target: { kind: 'habit', habit: 'no_alcohol' },
    weight: 12,
    onlyWeekend: true,
  },
  {
    key: 'momentum',
    multiplier: 1.5,
    target: { kind: 'all' },
    weight: 10,
    onlyAfterStreak: 5,
  },

  // --- Eventos de hábito (solo si ese hábito está activo) ---
  {
    key: 'rainy_day',
    multiplier: 2,
    target: { kind: 'habit', habit: 'train' },
    weight: 10,
  },
  {
    key: 'open_road',
    multiplier: 2,
    target: { kind: 'habit', habit: 'steps' },
    weight: 9,
  },
  {
    key: 'day_of_clarity',
    multiplier: 2,
    target: { kind: 'habit', habit: 'read' },
    weight: 8,
  },
  {
    key: 'restful_night',
    multiplier: 2,
    target: { kind: 'habit', habit: 'sleep' },
    weight: 8,
  },
  {
    key: 'last_cigarette',
    multiplier: 2,
    target: { kind: 'habit', habit: 'no_smoking' },
    weight: 9,
  },
  {
    key: 'digital_detox',
    multiplier: 2,
    target: { kind: 'habit', habit: 'no_social_media' },
    weight: 8,
  },
  {
    key: 'clean_plate',
    multiplier: 2,
    target: { kind: 'habit', habit: 'no_junk_food' },
    weight: 8,
  },
  {
    key: 'hydration_surge',
    multiplier: 2,
    target: { kind: 'habit', habit: 'water' },
    weight: 8,
  },
  {
    key: 'fuel_up',
    multiplier: 2,
    target: { kind: 'habit', habit: 'eat_well' },
    weight: 9,
  },
  {
    key: 'deep_focus',
    multiplier: 2,
    target: { kind: 'habit', habit: 'meditate' },
    weight: 8,
  },

  {
    key: 'cold_rush',
    multiplier: 2,
    target: { kind: 'habit', habit: 'cold_shower' },
    weight: 8,
  },
  {
    key: 'night_off',
    multiplier: 2,
    target: { kind: 'habit', habit: 'no_screens_bed' },
    weight: 8,
  },
  {
    key: 'trail_run',
    multiplier: 2,
    target: { kind: 'habit', habit: 'outdoor_time' },
    weight: 9,
  },
  {
    key: 'fasting_day',
    multiplier: 2,
    target: { kind: 'habit', habit: 'fasting' },
    weight: 8,
  },
  {
    key: 'page_of_truth',
    multiplier: 2,
    target: { kind: 'habit', habit: 'journaling' },
    weight: 8,
  },

  // --- Eventos globales ---
  {
    key: 'golden_day',
    multiplier: 2,
    target: { kind: 'all' },
    weight: 3, // raro
  },
  {
    key: 'steady_day',
    multiplier: 1, // sin bonus — banner nunca se muestra (multiplier > 1 en UI)
    target: { kind: 'all' },
    weight: 2, // fallback mínimo
  },
];
