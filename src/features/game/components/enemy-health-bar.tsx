'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Fases del enemigo según % de HP restante.
 * Cada cambio de fase añade dramatismo progresivo.
 */
function phaseFor(pct: number): {
  emoji: string;
  label: string;
  barColor: string;
  glowColor: string;
} {
  if (pct <= 0)   return { emoji: '💀', label: 'dead',     barColor: '#4a4a4a',          glowColor: 'transparent' };
  if (pct < 0.15) return { emoji: '😱', label: 'critical', barColor: '#ff2d2d',          glowColor: 'rgba(255,45,45,0.35)' };
  if (pct < 0.35) return { emoji: '😤', label: 'enraged',  barColor: '#ff6b35',          glowColor: 'rgba(255,107,53,0.25)' };
  if (pct < 0.55) return { emoji: '😠', label: 'angry',    barColor: '#e05252',          glowColor: 'rgba(224,82,82,0.18)' };
  if (pct < 0.75) return { emoji: '😒', label: 'hurt',     barColor: '#c44d4d',          glowColor: 'transparent' };
  return            { emoji: '😈', label: 'full',     barColor: 'hsl(var(--destructive))', glowColor: 'transparent' };
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
}: {
  name: string;
  enemyKey: string;
  pct: number;
  defeated: boolean;
  defeatedLabel: string;
  hitKey?: number;
  /** Cambia para disparar animación de ataque (recaída). */
  relapseKey?: number;
}) {
  const [flashing, setFlashing] = useState(false);
  const [attacking, setAttacking] = useState(false);
  const [prevPhaseLabel, setPrevPhaseLabel] = useState('');
  const [phaseChanging, setPhaseChanging] = useState(false);

  const width = Math.max(0, Math.min(100, Math.round(pct * 100)));
  const phase = phaseFor(pct);

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
        {/* Retrato del enemigo */}
        <div
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-500"
          style={{
            borderColor: defeated ? '#4a4a4a' : phase.barColor,
            boxShadow: !defeated && phase.glowColor !== 'transparent'
              ? `0 0 12px ${phase.glowColor}`
              : undefined,
          }}
        >
          <Image
            src={`/enemies/${enemyKey}.png`}
            alt={name}
            fill
            className={`object-cover object-top transition-all duration-500 ${defeated ? 'grayscale opacity-40' : ''}`}
            sizes="56px"
          />
          {defeated && (
            <div className="absolute inset-0 flex items-center justify-center text-xl">💀</div>
          )}
          {/* Flash de daño sobre el retrato */}
          {flashing && (
            <div className="absolute inset-0 rounded-xl bg-destructive/30" />
          )}
        </div>

        {/* Nombre + barra */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase.emoji}
                  className="text-base"
                  aria-hidden="true"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {phase.emoji}
                </motion.span>
              </AnimatePresence>
              {name}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {defeated ? defeatedLabel : `${width}%`}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={width}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: phase.barColor }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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
                 phase.label === 'enraged'  ? '🔥 ENRAGED' :
                 phase.label === 'angry'    ? '😠 ANGRY' : ''}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
