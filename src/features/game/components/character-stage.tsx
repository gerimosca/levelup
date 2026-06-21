'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import type { CharacterTier } from '@/game-core';
import { HeroAvatar } from './hero-avatar';
import type { AvatarConfig, AvatarExpression, EquippedSlots } from '../types';
import { SKIN_TONES, HAIR_COLORS } from '../types';

const RING: Record<CharacterTier, { ring: string; glow: string }> = {
  initiate:   { ring: 'from-muted/40 to-transparent',   glow: 'rgba(169,178,195,0.15)' },
  apprentice: { ring: 'from-emerald-500/30 to-transparent', glow: 'rgba(46,204,113,0.25)' },
  warrior:    { ring: 'from-primary/40 to-transparent',  glow: 'rgba(108,92,231,0.35)' },
  veteran:    { ring: 'from-primary/50 to-transparent',  glow: 'rgba(108,92,231,0.45)' },
  hero:       { ring: 'from-accent/50 to-transparent',   glow: 'rgba(255,210,74,0.45)' },
  legend:     { ring: 'from-accent/70 to-transparent',   glow: 'rgba(255,210,74,0.6)' },
};

const IDLE = { y: [0, -6, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } };

// Ángulos (en grados) para las 8 partículas de celebración
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

interface Particle { id: number; angle: number; color: string }

let pid = 0;

export function CharacterStage({
  tier,
  tierLabel,
  levelLabel,
  equipped,
  avatarConfig,
  size = 'lg',
  celebrateKey = 0,
  attackKey = 0,
  auraColor,
  auraStrength = 'subtle',
  titleText,
}: {
  tier: CharacterTier;
  tierLabel: string;
  levelLabel: string;
  equipped?: EquippedSlots;
  avatarConfig?: AvatarConfig;
  size?: 'lg' | 'xl' | 'hero';
  celebrateKey?: number;
  attackKey?: number;
  auraColor?: string;
  auraStrength?: 'subtle' | 'medium' | 'strong';
  titleText?: string;
}) {
  const v = RING[tier];
  const dim = size === 'hero' ? 'h-60 w-60' : size === 'xl' ? 'h-44 w-44' : 'h-32 w-32';
  const controls = useAnimationControls();
  const [expression, setExpression] = useState<AvatarExpression>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showSlash, setShowSlash] = useState(false);
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    controls.start(IDLE);
  }, [controls]);

  // Celebración: salto + partículas + cara feliz
  useEffect(() => {
    if (!celebrateKey) return;
    let active = true;

    const colors = ['#FFD24A', '#76E2A6', '#9DBBFF', '#FF8C8C', '#BCB1FF', '#FFF'];
    const newParticles: Particle[] = PARTICLE_ANGLES.map((angle) => ({
      id: ++pid,
      angle,
      color: colors[Math.floor(angle / 45) % colors.length],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 900);

    if (exprTimer.current) clearTimeout(exprTimer.current);
    setExpression('happy');
    exprTimer.current = setTimeout(() => setExpression('idle'), 900);

    (async () => {
      await controls.start({
        y: [0, -32, 0],
        scale: [1, 1.18, 1],
        rotate: [0, -8, 8, 0],
        transition: { duration: 0.65, ease: 'easeOut' },
      });
      if (active) controls.start(IDLE);
    })();

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateKey]);

  // Ataque: lunge + slash + cara enfadada
  useEffect(() => {
    if (!attackKey) return;
    let active = true;

    setShowSlash(true);
    setTimeout(() => setShowSlash(false), 450);

    if (exprTimer.current) clearTimeout(exprTimer.current);
    setExpression('angry');
    exprTimer.current = setTimeout(() => setExpression('idle'), 600);

    (async () => {
      await controls.start({
        x: [0, 24, -4, 0],
        scale: [1, 1.14, 0.96, 1],
        rotate: [0, 14, -4, 0],
        transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      });
      if (active) controls.start(IDLE);
    })();

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackKey]);

  const auraAlpha = { subtle: '50', medium: '80', strong: 'B0' }[auraStrength];
  const boxShadow = auraColor
    ? `0 0 44px ${auraColor}${auraAlpha}, 0 12px 44px ${v.glow}`
    : `0 12px 44px ${v.glow}`;

  const heroName = avatarConfig?.heroName?.trim();

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Anillo de aura fuerte */}
        {auraColor && auraStrength === 'strong' && (
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{ inset: '-5px', border: `2px solid ${auraColor}` }}
            animate={{ opacity: [0.3, 0.85, 0.3], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Avatar principal */}
        <motion.div
          className={`flex ${dim} items-end justify-center rounded-full bg-gradient-to-b ${v.ring} p-2`}
          style={{ boxShadow }}
          animate={controls}
        >
          <HeroAvatar
            tier={tier}
            equipped={equipped}
            expression={expression}
            skinColor={avatarConfig?.skinKey ? SKIN_TONES[avatarConfig.skinKey] : undefined}
            hairColor={avatarConfig?.hairKey ? HAIR_COLORS[avatarConfig.hairKey] : undefined}
          />
        </motion.div>

        {/* FX: partículas de celebración */}
        <AnimatePresence>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * 52;
            const ty = Math.sin(rad) * 52;
            return (
              <motion.div
                key={p.id}
                className="pointer-events-none absolute rounded-full"
                style={{
                  width: 7, height: 7,
                  background: p.color,
                  top: '50%', left: '50%',
                  marginTop: -3.5, marginLeft: -3.5,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
              />
            );
          })}
        </AnimatePresence>

        {/* FX: slash de espada */}
        <AnimatePresence>
          {showSlash && (
            <motion.svg
              key="slash"
              className="pointer-events-none absolute inset-0"
              viewBox="0 0 120 120"
              initial={{ opacity: 0.9, pathLength: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ width: '100%', height: '100%' }}
            >
              <motion.path
                d="M 95 10 L 20 95"
                stroke="#fff"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <motion.path
                d="M 100 25 L 30 90"
                stroke="#DCE6FF"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.03, ease: 'easeOut' }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Nombre del héroe (si tiene) */}
      {heroName && (
        <p className="mt-2 text-sm font-bold tracking-wide">{heroName}</p>
      )}
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-accent">{tierLabel}</p>
      <p className={`font-bold ${heroName ? 'text-base' : 'text-lg'}`}>{levelLabel}</p>
      {titleText && (
        <p className="mt-0.5 text-xs font-semibold tracking-wide" style={{ color: auraColor }}>
          {titleText}
        </p>
      )}
    </div>
  );
}
