'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Hace que TODAS las animaciones framer-motion del juego respeten
 * `prefers-reduced-motion` (desactiva transforms/movimiento, mantiene opacidad).
 * framer-motion no respeta el @media de CSS por sí solo. Ver docs/design/03-ux-ui.md §8.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
