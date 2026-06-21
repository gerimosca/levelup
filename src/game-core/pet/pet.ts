/**
 * pet — La mascota: evoluciona por días de cuidado y refleja tu constancia.
 * Nunca muere ni penaliza. Ver docs/design/02-game-design.md §6.
 */
import type { PetStage, PetMood } from '../types';

const STAGE_THRESHOLDS: { stage: PetStage; minCareDays: number }[] = [
  { stage: 'final', minCareDays: 60 },
  { stage: 'adult', minCareDays: 25 },
  { stage: 'juvenile', minCareDays: 10 },
  { stage: 'hatchling', minCareDays: 3 },
  { stage: 'egg', minCareDays: 0 },
];

/** Etapa de la mascota según días de cuidado acumulados. */
export function petStageForCareDays(careDays: number): PetStage {
  const found = STAGE_THRESHOLDS.find((t) => careDays >= t.minCareDays);
  return found ? found.stage : 'egg';
}

/** Umbrales en orden ascendente (para calcular la siguiente etapa). */
const STAGES_ASC = [...STAGE_THRESHOLDS].reverse();

/**
 * Info de progreso hacia la siguiente etapa.
 * `next` es null si ya está en la etapa final. `progress` es 0..1 dentro del tramo actual.
 */
export function nextPetStageInfo(careDays: number): {
  next: PetStage | null;
  atCareDays: number | null;
  remaining: number;
  progress: number;
} {
  for (let i = 0; i < STAGES_ASC.length; i++) {
    if (careDays < STAGES_ASC[i].minCareDays) {
      const currentMin = i > 0 ? STAGES_ASC[i - 1].minCareDays : 0;
      const nextMin = STAGES_ASC[i].minCareDays;
      const span = nextMin - currentMin;
      return {
        next: STAGES_ASC[i].stage,
        atCareDays: nextMin,
        remaining: nextMin - careDays,
        progress: span > 0 ? (careDays - currentMin) / span : 1,
      };
    }
  }
  return { next: null, atCareDays: null, remaining: 0, progress: 1 };
}

/**
 * Ánimo según días desde la última actividad.
 * 0 = activo hoy → feliz; 1 → bien; 2 → cansada; 3+ → triste.
 */
export function petMood(daysSinceLastActive: number): PetMood {
  if (daysSinceLastActive <= 0) return 'happy';
  if (daysSinceLastActive === 1) return 'ok';
  if (daysSinceLastActive === 2) return 'tired';
  return 'sad';
}

/** ¿Volvió tras un bajón? (para la animación de reencuentro). */
export function isReunion(previousMood: PetMood, completedToday: boolean): boolean {
  return completedToday && (previousMood === 'sad' || previousMood === 'tired');
}

/** Se gana 1 escudo de racha cada N días de cuidado. */
export const SHIELD_EARN_EVERY = 7;

/** Máximo de escudos de racha que puede guardar la mascota según su etapa. */
export function maxShieldsForStage(stage: PetStage): number {
  switch (stage) {
    case 'egg':
      return 0;
    case 'hatchling':
      return 1;
    case 'juvenile':
      return 2;
    case 'adult':
      return 2;
    case 'final':
      return 3;
  }
}
