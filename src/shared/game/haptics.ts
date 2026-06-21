/**
 * haptics — feedback táctil (Vibration API en web; nativo en la futura app móvil).
 *
 * Acompaña los momentos clave (claim, level up...). Degrada a no-op si el
 * dispositivo/navegador no lo soporta o el usuario lo desactiva.
 * Ver docs/design/03-ux-ui.md §6.
 */
export type HapticPattern = 'light' | 'medium' | 'success' | 'warning';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [15, 40, 25],
  warning: [30, 50, 30],
};

let enabled = true;

export const haptics = {
  setEnabled(value: boolean) {
    enabled = value;
  },
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  },
  trigger(pattern: HapticPattern) {
    if (!enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      /* no-op: háptica es decorativa, nunca crítica */
    }
  },
};
