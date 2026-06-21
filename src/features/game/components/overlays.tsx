'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

function Overlay({
  children,
  onClose,
  cta,
}: {
  children: React.ReactNode;
  onClose: () => void;
  cta: string;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          {cta}
        </button>
      </motion.div>
    </motion.div>
  );
}

export function LevelUpOverlay({
  title,
  subtitle,
  cta,
  onClose,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose} cta={cta}>
      <motion.div
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-accent/40 to-accent/10"
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 0.8 }}
      >
        <Sparkles className="h-10 w-10 text-accent" aria-hidden="true" />
      </motion.div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </Overlay>
  );
}

export function MissionCompleteOverlay({
  title,
  subtitle,
  cta,
  onClose,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose} cta={cta}>
      <motion.div
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-primary/40 to-primary/10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
      >
        <Trophy className="h-10 w-10 text-primary" aria-hidden="true" />
      </motion.div>
      <h2 className="text-2xl font-bold tracking-wide">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </Overlay>
  );
}

export function SeasonVictoryOverlay({
  seasonName,
  enemyName,
  enemyKey,
  daysCompleted,
  streak,
  nextSeasonName,
  cta,
  onClose,
}: {
  seasonName: string;
  enemyName: string;
  enemyKey: string;
  daysCompleted: number;
  streak: number;
  nextSeasonName: string | null;
  cta: string;
  conquered: string;
  peakStreak: string;
  enemyDefeated: string;
  nextTeaser: string | null;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-background/95 backdrop-blur-md sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Glow de fondo */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
      </motion.div>

      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-accent/30 bg-card p-8 text-center"
        initial={{ y: 100, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        {/* Retrato del enemigo derrotado */}
        <motion.div
          className="relative mx-auto mb-4 h-32 w-32"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: [0, 1.15, 0.95, 1], rotate: 0 }}
          transition={{ duration: 0.7, ease: 'backOut' }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-accent/20">
            <Image
              src={`/enemies/${enemyKey}.png`}
              alt={enemyName}
              fill
              className="object-cover object-top grayscale"
              sizes="128px"
            />
            {/* Overlay oscuro de derrota */}
            <div className="absolute inset-0 bg-background/60" />
            {/* Skull */}
            <div className="absolute inset-0 flex items-center justify-center text-5xl">💀</div>
          </div>
          {/* Corona flotando arriba */}
          <motion.div
            className="absolute -right-2 -top-3 text-3xl"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          >
            👑
          </motion.div>
        </motion.div>

        {/* Nombre de temporada */}
        <motion.h2
          className="text-4xl font-black tracking-widest text-accent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {seasonName}
        </motion.h2>

        <motion.p
          className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {enemyName} defeated
        </motion.p>

        {/* Stats */}
        <motion.div
          className="mt-5 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="rounded-2xl bg-accent/10 px-4 py-3">
            <p className="text-2xl font-black text-accent">{daysCompleted}</p>
            <p className="text-xs text-muted-foreground">days conquered</p>
          </div>
          <div className="rounded-2xl bg-primary/10 px-4 py-3">
            <p className="text-2xl font-black text-primary">🔥 {streak}</p>
            <p className="text-xs text-muted-foreground">best streak</p>
          </div>
        </motion.div>

        {/* Siguiente temporada */}
        {nextSeasonName && (
          <motion.p
            className="mt-4 text-xs font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Next up → <span className="font-bold text-foreground">{nextSeasonName}</span>
          </motion.p>
        )}

        {/* CTA */}
        <motion.button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-accent py-3.5 font-bold text-accent-foreground transition-transform active:scale-95"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.96 }}
          style={{ color: 'hsl(218 22% 7%)' }}
        >
          {cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function SeasonStartOverlay({
  seasonName,
  enemyName,
  enemyKey,
  tagline,
  durationDays,
  cta,
  onClose,
}: {
  seasonName: string;
  enemyName: string;
  enemyKey: string;
  tagline: string;
  durationDays: number;
  cta: string;
  badge: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-background/95 backdrop-blur-md sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-destructive/30 bg-card p-8 text-center"
        style={{ boxShadow: '0 0 80px rgba(255,45,45,0.18)' }}
        initial={{ y: 80, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* Retrato del enemigo — amenazante, a pleno color */}
        <motion.div
          className="relative mx-auto mb-5 h-36 w-36 overflow-hidden rounded-2xl border-2 border-destructive/50"
          style={{ boxShadow: '0 0 40px rgba(255,45,45,0.35)' }}
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
        >
          <Image
            src={`/enemies/${enemyKey}.png`}
            alt={enemyName}
            fill
            className="object-cover object-top"
            sizes="144px"
          />
          {/* Vignette inferior */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card/80 to-transparent" />
        </motion.div>

        <motion.p
          className="text-xs font-bold uppercase tracking-widest text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {durationDays} days · Face {enemyName}
        </motion.p>

        <motion.h2
          className="mt-1 text-4xl font-black tracking-widest text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {seasonName}
        </motion.h2>

        <motion.p
          className="mt-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {tagline}
        </motion.p>

        <motion.button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground transition-transform active:scale-95"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.96 }}
        >
          {cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function StreakMilestoneOverlay({
  title,
  label,
  sub,
  cta,
  onClose,
}: {
  title: string;
  label: string;
  sub: string;
  cta: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl border border-orange-500/30 bg-card p-8 text-center"
        style={{ boxShadow: '0 0 80px rgba(249,115,22,0.25)' }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="mx-auto mb-4 text-7xl"
          animate={{
            scale: [1, 1.2, 0.95, 1.1, 1],
            rotate: [0, -5, 5, -3, 0],
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          🔥
        </motion.div>

        <motion.h2
          className="text-4xl font-extrabold tracking-tight text-orange-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="mt-1 text-lg font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {label}
        </motion.p>

        <motion.p
          className="mt-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {sub}
        </motion.p>

        <motion.button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition-transform active:scale-95"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.96 }}
        >
          {cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
