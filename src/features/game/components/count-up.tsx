'use client';

import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/** Número que sube animadamente de 0 al valor (impacto visual, estilo Archero). */
export function CountUp({
  value,
  decimals = 0,
  duration = 0.9,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{n.toFixed(decimals)}</>;
}
