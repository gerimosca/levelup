'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChestRewardResult } from '../types';

// Partículas que salen del cofre al abrirse
const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const COLORS = ['#FFD24A', '#76E2A6', '#9DBBFF', '#FF8C8C', '#BCB1FF', '#fff', '#FFD24A', '#76E2A6', '#9DBBFF', '#FF8C8C', '#BCB1FF', '#fff'];

type Phase = 'idle' | 'shaking' | 'opening' | 'reveal';

export function ChestReveal({
  chest,
  rarityColor,
  rarityGlow,
  rarityLabel,
  itemName,
  newLabel,
  ownedLabel,
  closeLabel,
  onClose,
}: {
  chest: ChestRewardResult;
  rarityColor: string;
  rarityGlow: string;
  rarityLabel: string;
  itemName: string;
  newLabel: string;
  ownedLabel: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [particles, setParticles] = useState<{ id: number; angle: number; color: string }[]>([]);

  // Secuencia automática: idle → shaking → opening → reveal
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shaking'), 400);
    const t2 = setTimeout(() => {
      setPhase('opening');
      setParticles(ANGLES.map((angle, i) => ({ id: i, angle, color: COLORS[i] })));
      setTimeout(() => setParticles([]), 800);
    }, 1100);
    const t3 = setTimeout(() => setPhase('reveal'), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const chestEmoji = phase === 'opening' || phase === 'reveal' ? '📦' : '🎁';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/92 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={phase === 'reveal' ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="relative w-full max-w-xs rounded-3xl border border-border bg-card p-8 text-center"
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cofre + partículas */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          {/* Glow de fondo cuando se abre */}
          <AnimatePresence>
            {(phase === 'opening' || phase === 'reveal') && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${rarityColor}55 0%, transparent 70%)` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2.4, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Partículas */}
          <AnimatePresence>
            {particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const tx = Math.cos(rad) * 72;
              const ty = Math.sin(rad) * 72;
              return (
                <motion.div
                  key={p.id}
                  className="pointer-events-none absolute rounded-full"
                  style={{ width: 8, height: 8, background: p.color, top: '50%', left: '50%', marginTop: -4, marginLeft: -4, boxShadow: `0 0 6px ${p.color}` }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                />
              );
            })}
          </AnimatePresence>

          {/* El cofre */}
          <motion.div
            className="relative text-7xl"
            animate={
              phase === 'shaking'
                ? { rotate: [-6, 6, -8, 8, -5, 5, 0], y: [0, -4, 0, -4, 0] }
                : phase === 'opening'
                ? { scale: [1, 1.35, 0.9], rotate: 0 }
                : { scale: 1, rotate: 0 }
            }
            transition={
              phase === 'shaking'
                ? { duration: 0.65, ease: 'easeInOut' }
                : { duration: 0.4, ease: 'backOut' }
            }
          >
            {chestEmoji}
          </motion.div>
        </div>

        {/* Item reveal */}
        <AnimatePresence>
          {phase === 'reveal' && chest.itemKey && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {/* Badge de rareza */}
              <motion.span
                className="inline-block rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${rarityColor}22`, color: rarityColor }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {rarityLabel}
              </motion.span>

              {/* Nombre del item */}
              <motion.div
                className="mt-3 rounded-2xl border-2 px-5 py-3"
                style={{
                  borderColor: rarityColor,
                  boxShadow: `0 0 28px ${rarityGlow}`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 16 }}
              >
                <p className="text-lg font-extrabold" style={{ color: rarityColor }}>{itemName}</p>
              </motion.div>

              {/* Subtexto */}
              <motion.p
                className="mt-3 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {chest.newlyUnlocked ? newLabel : ownedLabel}
              </motion.p>

              {/* CTA */}
              <motion.button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl py-3 font-bold transition-transform active:scale-95"
                style={{ backgroundColor: rarityColor, color: '#0E1116' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileTap={{ scale: 0.95 }}
              >
                {closeLabel}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint para hacer tap durante la animación */}
        <AnimatePresence>
          {phase !== 'reveal' && (
            <motion.p
              className="mt-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
            >
              ✨
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
