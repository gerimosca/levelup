/**
 * player-store — estado de juego del jugador en cliente (Zustand).
 *
 * Espejo optimista del estado persistido en Supabase: la UI lee de aquí y se
 * actualiza al instante al reclamar; el servidor concilia después.
 * El nivel SIEMPRE se deriva del XP total con el motor (@/game-core).
 */
import { create } from 'zustand';
import { levelFromTotalXp, type LevelInfo, type AttributeType } from '@/game-core';

type AttributeMap = Record<AttributeType, number>;

const EMPTY_ATTRIBUTES: AttributeMap = {
  vitality: 0,
  strength: 0,
  discipline: 0,
  energy: 0,
  resistance: 0,
};

export interface PlayerSnapshot {
  xpTotal: number;
  streak: number;
  attributes: AttributeMap;
}

interface PlayerStore extends PlayerSnapshot {
  /** Nivel/tier/progreso derivados del XP total. */
  level: LevelInfo;
  /** Carga el estado desde el servidor (fuente de la verdad). */
  hydrate: (snapshot: Partial<PlayerSnapshot>) => void;
  /** Suma XP de forma optimista (la UI ya celebra; el server confirma). */
  addXp: (amount: number) => void;
  /** Reinicia al estado inicial (logout). */
  reset: () => void;
}

const initial: PlayerSnapshot = {
  xpTotal: 0,
  streak: 0,
  attributes: { ...EMPTY_ATTRIBUTES },
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initial,
  level: levelFromTotalXp(initial.xpTotal),
  hydrate: (snapshot) =>
    set((state) => {
      const xpTotal = snapshot.xpTotal ?? state.xpTotal;
      return {
        xpTotal,
        streak: snapshot.streak ?? state.streak,
        attributes: snapshot.attributes ?? state.attributes,
        level: levelFromTotalXp(xpTotal),
      };
    }),
  addXp: (amount) =>
    set((state) => {
      const xpTotal = Math.max(0, state.xpTotal + amount);
      return { xpTotal, level: levelFromTotalXp(xpTotal) };
    }),
  reset: () =>
    set({ ...initial, attributes: { ...EMPTY_ATTRIBUTES }, level: levelFromTotalXp(0) }),
}));
