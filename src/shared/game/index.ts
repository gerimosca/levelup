/**
 * shared/game — utilidades de cliente que envuelven el motor de juego:
 * estado (Zustand), audio y háptica. El motor puro vive en @/game-core.
 */
export { usePlayerStore } from './player-store';
export type { PlayerSnapshot } from './player-store';
export { audio } from './audio-manager';
export type { SfxKey } from './audio-manager';
export { haptics } from './haptics';
export type { HapticPattern } from './haptics';
