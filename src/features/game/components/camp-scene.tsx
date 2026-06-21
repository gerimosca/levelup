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
      style={{ background: 'linear-gradient(180deg, #0f1729 0%, #152d4a 40%, #1a3d2e 100%)', minHeight: 320 }}
    >
      {/* estrellas de fondo */}
      {[{ cx: '15%', cy: '12%', r: 1.2 }, { cx: '78%', cy: '8%', r: 0.9 }, { cx: '55%', cy: '6%', r: 1 },
        { cx: '32%', cy: '18%', r: 0.7 }, { cx: '88%', cy: '20%', r: 1.1 }, { cx: '6%', cy: '28%', r: 0.8 }].map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{ left: s.cx, top: s.cy, width: s.r * 2, height: s.r * 2, opacity: 0.4 }}
          animate={{ opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 2 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {/* estructuras del campamento — fila en la parte baja del fondo */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-wrap items-end justify-center gap-4 px-6 text-4xl opacity-70">
        {shown.map((s) => (
          <span key={s.key} aria-hidden="true" title={s.key}>
            {STRUCT_EMOJI[s.key] ?? '🏕️'}
          </span>
        ))}
      </div>

      {/* NPCs */}
      {npcs.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 flex flex-wrap justify-center gap-3 px-4 text-2xl opacity-60">
          {npcs.map((n) => (
            <span key={n.key} aria-hidden="true">{NPC_EMOJI[n.key] ?? '🧍'}</span>
          ))}
        </div>
      )}

      {/* suelo con gradiente */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
        style={{ background: 'linear-gradient(180deg, transparent 0%, #112210 100%)' }}
      />

      {/* héroe + mascota — centrado, slide-in desde la derecha cuando vuelve */}
      <motion.div
        key={expeditionReady ? 'returning' : 'home'}
        className="relative flex items-end justify-center px-4 pb-4 pt-6"
        initial={expeditionReady ? { x: 80, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
