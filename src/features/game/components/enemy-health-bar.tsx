'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function phaseFor(pct: number): {
  label: string;
  barColor: string;
  glowColor: string;
} {
  if (pct <= 0)   return { label: 'dead',     barColor: '#4a4a4a',          glowColor: 'transparent' };
  if (pct < 0.15) return { label: 'critical', barColor: '#ff2d2d',          glowColor: 'rgba(255,45,45,0.35)' };
  if (pct < 0.35) return { label: 'enraged',  barColor: '#ff6b35',          glowColor: 'rgba(255,107,53,0.25)' };
  if (pct < 0.55) return { label: 'angry',    barColor: '#e05252',          glowColor: 'rgba(224,82,82,0.18)' };
  if (pct < 0.75) return { label: 'hurt',     barColor: '#c44d4d',          glowColor: 'transparent' };
  return            { label: 'full',     barColor: 'hsl(var(--destructive))', glowColor: 'transparent' };
}

/** Retrato y expresión por tipo de enemigo y fase de HP. */
const ENEMY_PORTRAIT: Record<string, {
  full: string; hurt: string; angry: string; enraged: string; critical: string;
  bg: string;
}> = {
  laziness: { full: '🛋️', hurt: '😴', angry: '😮',  enraged: '😤', critical: '😱', bg: 'rgba(123,108,240,0.18)' },
  inertia:  { full: '🧱', hurt: '😒', angry: '😠',  enraged: '😤', critical: '😱', bg: 'rgba(66,121,238,0.18)'  },
  craving:  { full: '🍕', hurt: '😕', angry: '😠',  enraged: '😤', critical: '😱', bg: 'rgba(224,82,82,0.18)'  },
  void:     { full: '🌑', hurt: '👁️', angry: '😶',  enraged: '😤', critical: '😱', bg: 'rgba(30,30,50,0.45)'   },
  saboteur: { full: '😈', hurt: '😒', angry: '😠',  enraged: '😤', critical: '😱', bg: 'rgba(192,57,43,0.18)'  },
};

function enemyEmoji(portrait: (typeof ENEMY_PORTRAIT)[string] | undefined, label: string, defeated: boolean): string {
  if (defeated || !portrait) return '💀';
  return (portrait as Record<string, string>)[label] ?? portrait.full;
}

/** Barra de vida del enemigo con fases, flash de daño y animación de ataque. */
export function EnemyHealthBar({
  name,
  enemyKey,
  pct,
  defeated,
  defeatedLabel,
  hitKey = 0,
  relapseKey = 0,
  defeatedKey = 0,
}: {
  name: string;
  enemyKey: string;
  pct: number;
  defeated: boolean;
  defeatedLabel: string;
  hitKey?: number;
  relapseKey?: number;
  defeatedKey?: number;
}) {
  const [flashing, setFlashing] = useState(false);
  const [attacking, setAttacking] = useState(false);
  const [dying, setDying] = useState(false);
  const [prevPhaseLabel, setPrevPhaseLabel] = useState('');
  const [phaseChanging, setPhaseChanging] = useState(false);

  const width = Math.max(0, Math.min(100, Math.round(pct * 100)));
  const phase = phaseFor(pct);
  const portrait = ENEMY_PORTRAIT[enemyKey] ?? ENEMY_PORTRAIT.saboteur;
  const faceEmoji = enemyEmoji(portrait, phase.label, defeated);

  // Flash de daño recibido (el héroe golpea al enemigo)
  useEffect(() => {
    if (!hitKey) return;
    setFlashing(true);
    const t = setTimeout(() => setFlashing(false), 380);
    return () => clearTimeout(t);
  }, [hitKey]);

  // Animación de ataque (recaída — el enemigo golpea al héroe)
  useEffect(() => {
    if (!relapseKey) return;
    setAttacking(true);
    const t = setTimeout(() => setAttacking(false), 600);
    return () => clearTimeout(t);
  }, [relapseKey]);

  // Golpe de gracia — retrato colapsa dramáticamente
  useEffect(() => {
    if (!defeatedKey) return;
    setDying(true);
    const t = setTimeout(() => setDying(false), 750);
    return () => clearTimeout(t);
  }, [defeatedKey]);

  // Detectar cambio de fase
  useEffect(() => {
    if (!prevPhaseLabel) { setPrevPhaseLabel(phase.label); return; }
    if (phase.label !== prevPhaseLabel) {
      setPhaseChanging(true);
      setPrevPhaseLabel(phase.label);
      const t = setTimeout(() => setPhaseChanging(false), 800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.label]);

  return (
    <motion.div
      className="rounded-2xl border bg-card p-3 transition-colors duration-150"
      animate={
        attacking
          ? { x: [-4, 6, -5, 4, 0], transition: { duration: 0.35 } }
          : { x: 0 }
      }
      style={{
        opacity: defeated ? 0.55 : 1,
        borderColor: flashing ? 'hsl(var(--destructive))' : phaseChanging ? phase.barColor : undefined,
        backgroundColor: flashing
          ? 'hsl(var(--destructive) / 0.08)'
          : phaseChanging
          ? `${phase.glowColor}`
          : undefined,
        boxShadow: phase.glowColor !== 'transparent' && !defeated
          ? `0 0 24px ${phase.glowColor}`
          : undefined,
        transition: 'box-shadow 0.6s ease, background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Retrato del enemigo — emoji temático que cambia con la fase */}
        <motion.div
          className="relative flex h-14 w-14 shrink-0 select-none items-center justify-center overflow-hidden rounded-xl border-2 text-3xl transition-all duration-500"
          style={{
            borderColor: defeated ? '#4a4a4a' : phase.barColor,
            backgroundColor: defeated ? 'rgba(80,80,80,0.15)' : portrait.bg,
            boxShadow: !defeated && phase.glowColor !== 'transparent'
              ? `0 0 12px ${phase.glowColor}`
              : undefined,
          }}
          animate={
            dying
              ? { scale: [1, 1.3, 1.1, 0.6, 0.3], opacity: [1, 1, 1, 0.6, 0.2], x: [-5, 7, -6, 3, 0], rotate: [0, -8, 8, -4, 0] }
              : flashing
              ? { scale: [1, 1.18, 0.9, 1] }
              : { scale: 1 }
          }
          transition={{ duration: dying ? 0.65 : 0.28 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={faceEmoji}
              aria-hidden="true"
              className={defeated ? 'grayscale' : ''}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {faceEmoji}
            </motion.span>
          </AnimatePresence>
          {/* Flash rojo sobre el retrato cuando recibe golpe */}
          {flashing && (
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-destructive/25" />
          )}
        </motion.div>

        {/* Nombre + barra */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold">{name}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {defeated ? defeatedLabel : `${width}%`}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={width}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: phase.barColor }}
              animate={{
                width: `${width}%`,
                opacity: phase.label === 'critical' && !defeated ? [1, 0.55, 1] : 1,
              }}
              transition={{
                width: { duration: 0.5, ease: 'easeOut' },
                opacity: phase.label === 'critical' && !defeated
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : {},
              }}
            />
          </div>

          {/* Texto de fase */}
          <AnimatePresence>
            {phaseChanging && phase.label !== 'full' && phase.label !== 'dead' && (
              <motion.p
                className="mt-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: phase.barColor }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {phase.label === 'critical' ? '⚠️ CRITICAL' :
                 phase.label === 'enraged'  ? '🔥 ENRAGED'  :
                 phase.label === 'angry'    ? '😠 ANGRY'    : ''}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
