'use client';

import { motion } from 'framer-motion';

/**
 * Número de XP que sube y se desvanece + destellos (sensación de progreso
 * constante, estilo Archero). Se monta tras reclamar y se autodestruye.
 */
export function FloatingReward({ amount, onDone }: { amount: number; onDone: () => void }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-8 z-40 -translate-x-1/2">
      <motion.div
        className="text-2xl font-extrabold text-accent"
        style={{ textShadow: '0 2px 14px rgba(255,210,74,0.7)' }}
        initial={{ y: 8, opacity: 0, scale: 0.6 }}
        animate={{ y: -52, opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        onAnimationComplete={onDone}
      >
        +{amount} XP
      </motion.div>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / 5) * Math.PI * 2) * 28,
            y: Math.sin((i / 5) * Math.PI * 2) * 28,
            scale: 0,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
