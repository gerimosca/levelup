'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/** Pide el valor de un hábito gradual (litros, horas, pasos) antes de reclamar. */
export function ClaimValueDialog({
  title,
  unit,
  defaultValue,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  unit: string;
  defaultValue: number;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6"
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-lg font-semibold"
            aria-label={title}
          />
          <span className="shrink-0 text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border py-3 font-semibold transition-transform active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(value)}
            className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
