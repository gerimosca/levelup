'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CRAFTABLE_ITEMS, EQUIPMENT_BY_KEY, RARITY, type RarityKey } from '@/game-core';
import { craftItemAction, getOwnedCraftKeysAction } from '../game.actions';

interface CraftForgeProps {
  materials: Record<string, number>;
  /** Refresca materiales en el padre cuando se craftea un item. */
  onCrafted: () => void;
}

export function CraftForge({ materials, onCrafted }: CraftForgeProps) {
  const th = useTranslations('home');
  const tg = useTranslations('game');
  const [crafting, setCrafting] = useState<string | null>(null);
  const [ownedKeys, setOwnedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    getOwnedCraftKeysAction().then((keys) => setOwnedKeys(new Set(keys)));
  }, []);

  const canAfford = (cost: Record<string, number>) =>
    Object.entries(cost).every(([k, v]) => (materials[k] ?? 0) >= v);

  const craft = async (key: string) => {
    if (crafting) return;
    setCrafting(key);
    const res = await craftItemAction(key);
    setCrafting(null);
    if (res.success) {
      const item = EQUIPMENT_BY_KEY[key];
      toast.success(th('forge.crafted', { name: tg(`equipment.${key}.name`) }), {
        description: item ? tg(`rarity.${item.rarity}`) : undefined,
      });
      setOwnedKeys((prev) => new Set([...prev, key]));
      onCrafted();
    } else if (res.error === 'already_owned') {
      toast.info(th('forge.alreadyOwned'));
    } else {
      toast.error(th('forge.insufficient'));
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold">
        <span aria-hidden="true">⚒️</span>
        {th('forge.title')}
      </p>
      <div className="space-y-2">
        {CRAFTABLE_ITEMS.map((c) => {
          const def = EQUIPMENT_BY_KEY[c.key];
          if (!def) return null;
          const rarity = RARITY[def.rarity as RarityKey];
          const isOwned = ownedKeys.has(c.key);
          const affordable = canAfford(c.cost);
          const isCrafting = crafting === c.key;

          return (
            <motion.div
              key={c.key}
              className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: isOwned ? 'hsl(var(--border))' : `${rarity.color}40`,
                opacity: isOwned ? 0.55 : 1,
              }}
              layout
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">
                  <span
                    className="mr-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: `${rarity.color}22`, color: rarity.color }}
                  >
                    {tg(`rarity.${def.rarity}`)}
                  </span>
                  {tg(`equipment.${c.key}.name`)}
                </p>
                <p className="mt-0.5 flex gap-2 text-[11px] text-muted-foreground">
                  {Object.entries(c.cost).map(([k, v]) => (
                    <span key={k} className={(materials[k] ?? 0) >= v ? '' : 'text-destructive'}>
                      {k === 'wood' ? '🪵' : '🪨'} {v}
                    </span>
                  ))}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {isOwned ? (
                  <motion.span
                    key="owned"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[11px] font-semibold text-muted-foreground"
                  >
                    ✓ {th('forge.owned')}
                  </motion.span>
                ) : (
                  <motion.button
                    key="craft"
                    type="button"
                    onClick={() => craft(c.key)}
                    disabled={!affordable || !!crafting}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                    style={{
                      backgroundColor: affordable ? `${rarity.color}22` : 'hsl(var(--secondary))',
                      color: affordable ? rarity.color : 'hsl(var(--muted-foreground))',
                    }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {isCrafting ? '…' : th('forge.craft')}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
