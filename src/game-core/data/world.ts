/**
 * Constantes del "mundo vivo": expedición, materiales, ritmo.
 * Ver docs/design/08-world-spec.md.
 */

/** Materiales del campamento (moneda ganada con hábitos + expediciones). */
export const MATERIALS = ['wood', 'stone'] as const;
export type MaterialKey = (typeof MATERIALS)[number];

/** Horas hasta que la expedición vuelve con su botín. */
export const EXPEDITION_HOURS = 6;

/** Materiales que da cada hábito cumplido (construir = trabajar). */
export const MATERIAL_PER_HABIT = 1;
