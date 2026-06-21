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

export const PET_THOUGHTS: Record<PetMood, string[]> = {
  happy: [
    'You trained today. I can feel it! 💪',
    'Best day ever! Keep going! ⭐',
    'I believe in you more every day.',
  ],
  ok: [
    'Just chilling at the camp...',
    'A quiet day is still a good day.',
    'Every habit counts, big or small.',
  ],
  tired: [
    'Zzz... even heroes rest.',
    'Rest now, conquer tomorrow.',
    'I need a nap. Wake me up for training.',
  ],
  sad: [
    "Don't give up. I'm still here.",
    "It's okay. Tomorrow is a new day.",
    'Even tough days make us stronger.',
  ],
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
