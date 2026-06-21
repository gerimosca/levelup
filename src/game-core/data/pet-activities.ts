import type { PetMood } from '../types';

export const PET_ACTIVITIES = ['training', 'reading', 'fishing', 'fire', 'sleeping'] as const;
export type PetActivity = (typeof PET_ACTIVITIES)[number];

export const PET_ACTIVITY_EMOJI: Record<PetActivity, string> = {
  training: '🏋️',
  reading: '📖',
  fishing: '🎣',
  fire: '🔥',
  sleeping: '💤',
};

/**
 * Actividad de la mascota en el campamento según la hora local y su estado de ánimo.
 * Si está triste o cansada, siempre descansa.
 */
export function petActivityForHour(hour: number, mood: PetMood): PetActivity {
  if (mood === 'sad' || mood === 'tired') return 'sleeping';
  if (hour >= 6 && hour < 10) return 'training';
  if (hour >= 10 && hour < 14) return 'reading';
  if (hour >= 14 && hour < 17) return 'fishing';
  if (hour >= 17 && hour < 21) return 'fire';
  return 'sleeping';
}
