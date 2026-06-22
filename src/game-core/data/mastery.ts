/**
 * Maestría de atributos: hitos de rango que desbloquean efectos visuales y títulos.
 * Cada atributo tiene los mismos 4 hitos; el título de maestro es único por atributo.
 */

export interface MasteryMilestone {
  rank: number;
  /** Clave de efecto (i18n: game.mastery.<effectKey>) */
  effectKey: 'auraAwaken' | 'auraMedium' | 'auraStrong' | 'master';
  icon: string;
}

export const MASTERY_MILESTONES: MasteryMilestone[] = [
  { rank: 3,  effectKey: 'auraAwaken', icon: '✨' },
  { rank: 5,  effectKey: 'auraMedium', icon: '💫' },
  { rank: 7,  effectKey: 'auraStrong', icon: '🌟' },
  { rank: 10, effectKey: 'master',     icon: '⚡' },
];

/** Título equippable que se desbloquea cuando el atributo llega a rank 10. */
export const ATTR_MASTER_TITLE: Record<string, string> = {
  vitality:   'vitality_master',
  strength:   'strength_master',
  discipline: 'discipline_master',
  energy:     'energy_master',
  resistance: 'resistance_master',
};
