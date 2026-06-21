'use client';

import { motion } from 'framer-motion';
import { CAMP_STRUCTURES, presentNpcs } from '@/game-core';

const STRUCT_EMOJI: Record<string, string> = {
  tent: '⛺',
  campfire: '🔥',
  house: '🏠',
  grove: '🌳',
  workshop: '🛖',
  stable: '🐎',
  gardens: '🌺',
  fountain: '⛲',
  library: '📚',
  gym: '🏋️',
  statues: '🗿',
  market: '🏪',
};

/** Emoji de cada NPC (placeholder; el arte final será ilustración/Rive). */
export const NPC_EMOJI: Record<string, string> = {
  elder: '🧓',
  explorer: '🧗',
  blacksmith: '🧑‍🏭',
  librarian: '🧑‍🏫',
  trainer: '🤸',
  cook: '🧑‍🍳',
};

/**
 * El campamento como escena (la Home). Crece con cada estructura y se puebla de NPCs.
 * expeditionReady — cuando es true el héroe entra desde la derecha (acaba de volver).
 */
export function CampScene({
  built,
  expeditionReady,
  children,
}: {
  built: string[];
  expeditionReady?: boolean;
  children: React.ReactNode;
}) {
  const builtSet = new Set([...built, 'tent']); // la tienda siempre está
  const shown = CAMP_STRUCTURES.filter((s) => builtSet.has(s.key));
  const npcs = presentNpcs(builtSet);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border"
      style={{ background: 'linear-gradient(180deg, #16213e 0%, #173455 55%, #1d3a2c 100%)' }}
    >
      {/* la aldea */}
      <div className="flex flex-wrap items-end justify-center gap-3 px-4 pt-5 text-3xl">
        {shown.map((s) => (
          <span key={s.key} aria-hidden="true">
            {STRUCT_EMOJI[s.key] ?? '🏕️'}
          </span>
        ))}
      </div>
      {/* habitantes */}
      {npcs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 px-4 pt-2 text-xl">
          {npcs.map((n) => (
            <span key={n.key} aria-hidden="true">
              {NPC_EMOJI[n.key] ?? '🧍'}
            </span>
          ))}
        </div>
      )}
      {/* héroe + mascota — slide-in desde la derecha cuando vuelve de expedición */}
      <motion.div
        key={expeditionReady ? 'returning' : 'home'}
        className="flex items-end justify-center gap-3 px-4 pb-3 pt-1"
        initial={expeditionReady ? { x: 72, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
