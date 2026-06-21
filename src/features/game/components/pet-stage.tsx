'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import type { PetStage as Stage, PetMood, PetActivity } from '@/game-core';
import { PET_ACTIVITY_EMOJI } from '@/game-core';
import { PetAvatar } from './pet-avatar';

const MOOD_ANIM: Record<PetMood, TargetAndTransition> = {
  happy: { y: [0, -12, 0], rotate: [0, -6, 6, 0], transition: { duration: 1.2, repeat: Infinity } },
  ok: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity } },
  tired: { rotate: [0, 3, -3, 0], transition: { duration: 3, repeat: Infinity } },
  sad: { y: [0, 2, 0], opacity: [1, 0.85, 1], transition: { duration: 3.5, repeat: Infinity } },
};

export function PetStage({
  stage,
  mood,
  size = 64,
  activity,
}: {
  stage: Stage;
  mood: PetMood;
  size?: number;
  activity?: PetActivity;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        style={{ width: size, height: size }}
        animate={MOOD_ANIM[mood]}
        aria-hidden="true"
      >
        <PetAvatar stage={stage} mood={mood} />
      </motion.div>
      {activity && (
        <motion.div
          className="pointer-events-none absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card text-sm shadow-md"
          aria-hidden="true"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {PET_ACTIVITY_EMOJI[activity]}
        </motion.div>
      )}
    </div>
  );
}
