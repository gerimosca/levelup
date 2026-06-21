'use client';

import { motion } from 'framer-motion';
import { RARITY, topRarity, type CharacterTier, type RarityKey } from '@/game-core';
import type { AvatarExpression, EquippedSlots } from '../types';

interface TierLook {
  armor: string;
  armorDark: string;
  trim: string;
  skin: string;
  hair: string;
  cape: string | null;
  pauldrons: boolean;
  weapon: 'none' | 'dagger' | 'sword' | 'greatsword';
  blade: string;
  headgear: 'hood' | 'band' | 'open-helm' | 'full-helm' | 'winged' | 'crown';
  aura: number;
  auraColor: string;
}

const LOOK: Record<CharacterTier, TierLook> = {
  initiate:   { armor: '#7A828F', armorDark: '#535B68', trim: '#9CA3AF', skin: '#F0C49B', hair: '#5A3E2B', cape: null,      pauldrons: false, weapon: 'none',       blade: '#C7CCD4', headgear: 'hood',      aura: 0,   auraColor: '#9CA3AF' },
  apprentice: { armor: '#36A968', armorDark: '#227A49', trim: '#76E2A6', skin: '#F0C49B', hair: '#5A3E2B', cape: null,      pauldrons: false, weapon: 'dagger',     blade: '#D7DBE0', headgear: 'band',      aura: 0.3, auraColor: '#2ECC71' },
  warrior:    { armor: '#4279EE', armorDark: '#2A50A8', trim: '#9DBBFF', skin: '#F0C49B', hair: '#5A3E2B', cape: '#2A50A8', pauldrons: true,  weapon: 'sword',      blade: '#DCE6FF', headgear: 'open-helm', aura: 0.5, auraColor: '#6C5CE7' },
  veteran:    { armor: '#7B6CF0', armorDark: '#4B3FB0', trim: '#BCB1FF', skin: '#F0C49B', hair: '#5A3E2B', cape: '#4B3FB0', pauldrons: true,  weapon: 'sword',      blade: '#E7E1FF', headgear: 'full-helm', aura: 0.7, auraColor: '#6C5CE7' },
  hero:       { armor: '#D8B43A', armorDark: '#9A7B16', trim: '#FFE07A', skin: '#F0C49B', hair: '#5A3E2B', cape: '#B03050', pauldrons: true,  weapon: 'greatsword', blade: '#FFF3C4', headgear: 'winged',    aura: 0.9, auraColor: '#FFD24A' },
  legend:     { armor: '#F2CE2E', armorDark: '#BE9400', trim: '#FFF1B0', skin: '#F0C49B', hair: '#5A3E2B', cape: '#8A1538', pauldrons: true,  weapon: 'greatsword', blade: '#FFFAE0', headgear: 'crown',     aura: 1,   auraColor: '#FFD24A' },
};

const STROKE = '#23293a';

const CAPE_A = 'M40 60 Q60 52 80 60 L92 134 L60 122 L28 134 Z';
const CAPE_B = 'M40 60 Q60 52 80 60 L86 135 L60 124 L24 133 Z';

// Shapes de boca por expresión
const MOUTH: Record<AvatarExpression, string> = {
  idle:   'M55 45 Q60 48 65 45',
  happy:  'M53 44 Q60 51 67 44',
  angry:  'M55 46 Q60 43 65 46',
};

// Cejas: [left path, right path] por expresión
const BROWS: Record<AvatarExpression, [string, string]> = {
  idle:  ['M48 32 Q52 30 56 32', 'M64 32 Q68 30 72 32'],
  happy: ['M48 30 Q52 27 56 30', 'M64 30 Q68 27 72 30'],
  angry: ['M48 33 Q52 29 56 32', 'M64 32 Q68 29 72 33'],
};

export function HeroAvatar({
  tier,
  equipped,
  skinColor,
  hairColor,
  expression = 'idle',
}: {
  tier: CharacterTier;
  equipped?: EquippedSlots;
  skinColor?: string;
  hairColor?: string;
  expression?: AvatarExpression;
}) {
  const c = LOOK[tier];
  const skin = skinColor ?? c.skin;
  const hair = hairColor ?? c.hair;

  // Sombra de piel: oscurece en ~15% para el lado en sombra
  const skinShadow = skinColor
    ? skinColor + 'CC'
    : (() => {
        const hex = c.skin.replace('#', '');
        const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 38).toString(16).padStart(2, '0');
        const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 30).toString(16).padStart(2, '0');
        const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 20).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      })();

  const eq = equipped ?? {};
  const rcol = (slot: string): string | null => {
    const it = eq[slot];
    return it ? RARITY[it.rarity].color : null;
  };
  const ekey = (slot: string): string | null => eq[slot]?.key ?? null;

  const top = topRarity(Object.values(eq).map((it) => it!.rarity));
  const auraCol = top ? RARITY[top].color : c.auraColor;
  const auraOp = c.aura * 0.16 + (top ? 0.14 : 0);

  const capeColor = rcol('back') ?? c.cape;
  const handsItem = ekey('hands');
  const bladeColor = handsItem === 'volcano_blade' ? rcol('hands')! : c.blade;
  const gauntlet = handsItem === 'warrior_gloves' ? rcol('hands')! : c.armorDark;
  const showWeapon = c.weapon !== 'none' || (handsItem && handsItem !== 'sage_book');
  const bladeTopY = c.weapon === 'greatsword' || handsItem === 'volcano_blade' ? 40 : c.weapon === 'dagger' ? 66 : 48;

  const aid = `a-${tier}`;
  const cid = `c-${tier}`;
  const fid = `f-${tier}`;

  const mouthPath = MOUTH[expression];
  const [browL, browR] = BROWS[expression];

  return (
    <svg viewBox="0 0 120 168" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={aid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.armor} />
          <stop offset="1" stopColor={c.armorDark} />
        </linearGradient>
        {capeColor && (
          <linearGradient id={cid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={capeColor} />
            <stop offset="1" stopColor={STROKE} stopOpacity="0.5" />
          </linearGradient>
        )}
        {/* Gradiente facial: luz arriba-izquierda, sombra abajo-derecha */}
        <radialGradient id={fid} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="60%" stopColor={skin} stopOpacity="1" />
          <stop offset="100%" stopColor={skinShadow} stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* aura que late */}
      {auraOp > 0 && (
        <motion.circle
          cx="60" cy="74" r="52" fill={auraCol}
          animate={{ opacity: [auraOp, auraOp * 1.5, auraOp], r: [50, 56, 50] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <ellipse cx="60" cy="156" rx="26" ry="5" fill="#000" opacity="0.18" />

      {/* capa con vaivén */}
      {capeColor && (
        <motion.path
          fill={`url(#${cid})`} stroke={STROKE} strokeWidth="1.4"
          animate={{ d: [CAPE_A, CAPE_B, CAPE_A] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* piernas + botas */}
      <rect x="49" y="106" width="9" height="24" rx="4" fill={c.armorDark} stroke={STROKE} strokeWidth="1.4" />
      <rect x="62" y="106" width="9" height="24" rx="4" fill={c.armorDark} stroke={STROKE} strokeWidth="1.4" />
      <path d="M45 130 q-2 8 4 8 h11 q3 0 3 -4 v-6 z" fill={rcol('feet') ?? c.trim} stroke={STROKE} strokeWidth="1.4" />
      <path d="M75 130 q2 8 -4 8 h-11 q-3 0 -3 -4 v-6 z" fill={rcol('feet') ?? c.trim} stroke={STROKE} strokeWidth="1.4" />

      {/* brazo izquierdo + mano */}
      <rect x="30" y="64" width="11" height="38" rx="5.5" fill={`url(#${aid})`} stroke={STROKE} strokeWidth="1.4" />
      <circle cx="35.5" cy="101" r="6" fill={gauntlet} stroke={STROKE} strokeWidth="1.4" />

      {/* accesorio */}
      {ekey('accessory') === 'legendary_bottle' && (
        <g stroke={STROKE} strokeWidth="1.2">
          <rect x="29" y="88" width="9" height="13" rx="3" fill={rcol('accessory')!} />
          <rect x="32" y="83" width="3" height="6" fill={rcol('accessory')!} />
        </g>
      )}
      {ekey('accessory') === 'cave_lantern' && (
        <g stroke={STROKE} strokeWidth="1.2">
          <rect x="29" y="88" width="10" height="11" rx="2" fill="#2a3340" />
          <rect x="31" y="90" width="6" height="7" rx="1" fill={rcol('accessory')!} />
          <line x1="34" y1="84" x2="34" y2="88" />
        </g>
      )}
      {ekey('accessory') === 'forest_charm' && (
        <g stroke={STROKE} strokeWidth="1.2">
          <line x1="34" y1="84" x2="34" y2="90" />
          <path d="M34 90 l5 4 l-5 5 l-5 -5 z" fill={rcol('accessory')!} />
        </g>
      )}

      {/* libro en mano izquierda */}
      {handsItem === 'sage_book' && (
        <g stroke={STROKE} strokeWidth="1.3">
          <rect x="27" y="93" width="15" height="12" rx="1.5" fill={rcol('hands')!} />
          <line x1="34.5" y1="93" x2="34.5" y2="105" stroke="#fff" strokeWidth="1" opacity="0.7" />
        </g>
      )}

      {/* torso */}
      <path d="M41 62 Q60 54 79 62 L77 112 Q60 120 43 112 Z" fill={`url(#${aid})`} stroke={STROKE} strokeWidth="1.6" />
      <path d="M52 66 Q60 62 68 66 L66 90 Q60 94 54 90 Z" fill={c.trim} opacity="0.32" />
      <path d="M60 60 L60 112" stroke={STROKE} strokeWidth="1.1" opacity="0.4" />
      <rect x="43" y="102" width="34" height="7" rx="3.5" fill={c.trim} stroke={STROKE} strokeWidth="1.1" />
      <rect x="56" y="103" width="8" height="5" rx="1.5" fill={c.armorDark} />

      {/* pecho */}
      {ekey('chest') === 'temple_relic' ? (
        <path d="M60 76 l6 6 l-6 7 l-6 -7 z" fill={rcol('chest')!} stroke={STROKE} strokeWidth="1.3" />
      ) : rcol('chest') ? (
        <g>
          <circle cx="60" cy="82" r="6.5" fill={rcol('chest')!} stroke={STROKE} strokeWidth="1.4" />
          <circle cx="60" cy="82" r="2.6" fill="#fff" opacity="0.9" />
        </g>
      ) : null}

      {/* pauldrones */}
      {c.pauldrons && <ellipse cx="38" cy="64" rx="11" ry="8" fill={c.trim} stroke={STROKE} strokeWidth="1.4" />}
      {c.pauldrons && <ellipse cx="82" cy="64" rx="11" ry="8" fill={c.trim} stroke={STROKE} strokeWidth="1.4" />}

      {/* brazo derecho */}
      <rect x="79" y="64" width="11" height="38" rx="5.5" fill={`url(#${aid})`} stroke={STROKE} strokeWidth="1.4" />

      {/* arma */}
      {showWeapon && (
        <g stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round">
          <path d={`M84.5 92 L80.5 ${bladeTopY} L84.5 ${bladeTopY - 7} L88.5 ${bladeTopY} Z`} fill={bladeColor} />
          <rect x="77" y="92" width="15" height="4" rx="2" fill="#8a5a2b" />
          <rect x="82.5" y="95" width="4" height="11" rx="2" fill="#6b4a2b" />
          <circle cx="84.5" cy="107" r="2.3" fill={c.trim} />
          <motion.line
            x1="84.5" y1={bladeTopY + 4} x2="84.5" y2="88" stroke="#fff" strokeWidth="1.2"
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
          />
        </g>
      )}
      <circle cx="84.5" cy="101" r="6" fill={gauntlet} stroke={STROKE} strokeWidth="1.4" />

      {/* cuello + cabeza con gradiente facial */}
      <rect x="55" y="47" width="10" height="9" fill={skin} />
      <circle cx="60" cy="37" r="19" fill={`url(#${fid})`} stroke={STROKE} strokeWidth="1.6" />

      {/* pelo */}
      {(c.headgear === 'hood' || c.headgear === 'band' || c.headgear === 'crown') && ekey('head') !== 'mountain_horn' && (
        <path d="M42 33 Q44 19 60 18 Q76 19 78 33 Q70 27 60 27 Q50 27 42 33 Z" fill={hair} />
      )}

      {/* cejas — cambian con expresión */}
      <path d={browL} stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d={browR} stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />

      {/* ojos + parpadeo */}
      <ellipse cx="53" cy="38" rx="2.4" ry="3.1" fill="#1a1a1a" />
      <ellipse cx="67" cy="38" rx="2.4" ry="3.1" fill="#1a1a1a" />
      <circle cx="52.2" cy="36.8" r="0.9" fill="#fff" />
      <circle cx="66.2" cy="36.8" r="0.9" fill="#fff" />
      <motion.rect
        x="50" width="6" fill={`url(#${fid})`}
        animate={{ height: [0, 0, 7, 0], y: [35, 35, 35, 35] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.97, 1], ease: 'easeInOut' }}
      />
      <motion.rect
        x="64" width="6" fill={`url(#${fid})`}
        animate={{ height: [0, 0, 7, 0], y: [35, 35, 35, 35] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.97, 1], ease: 'easeInOut' }}
      />

      {/* boca — cambia con expresión */}
      <path d={mouthPath} stroke="#b06a4a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* dientes visibles solo cuando sonríe */}
      {expression === 'happy' && (
        <path d="M55 46 Q60 49 65 46 Q60 50 55 46 Z" fill="#fff" opacity="0.85" />
      )}

      {/* mejilla rubor — solo cuando está feliz */}
      {expression === 'happy' && (
        <>
          <ellipse cx="47" cy="43" rx="4" ry="2.5" fill="#FF8C8C" opacity="0.35" />
          <ellipse cx="73" cy="43" rx="4" ry="2.5" fill="#FF8C8C" opacity="0.35" />
        </>
      )}

      {/* tocado */}
      {ekey('head') === 'mountain_horn' ? (
        <g fill={rcol('head')!} stroke={STROKE} strokeWidth="1.2">
          <path d="M46 26 q-8 -4 -10 -14 q8 4 12 12 z" />
          <path d="M74 26 q8 -4 10 -14 q-8 4 -12 12 z" />
        </g>
      ) : ekey('head') && ekey('head') !== 'mountain_horn' ? (
        <path d="M45 27 L49 13 L56 23 L60 11 L64 23 L71 13 L75 27 Z" fill={rcol('head')!} stroke={STROKE} strokeWidth="1.2" />
      ) : (
        <>
          {c.headgear === 'hood' && (
            <path d="M41 37 Q40 17 60 16 Q80 17 79 37 Q79 29 70 25 L50 25 Q41 29 41 37 Z" fill={c.armorDark} stroke={STROKE} strokeWidth="1.4" />
          )}
          {c.headgear === 'band' && <rect x="42" y="28" width="36" height="6" rx="3" fill={c.trim} stroke={STROKE} strokeWidth="1.2" />}
          {c.headgear === 'open-helm' && (
            <path d="M42 39 Q42 19 60 19 Q78 19 78 39 L78 31 Q60 25 42 31 Z" fill={c.trim} stroke={STROKE} strokeWidth="1.4" />
          )}
          {c.headgear === 'full-helm' && (
            <g stroke={STROKE} strokeWidth="1.4">
              <path d="M42 41 Q42 17 60 17 Q78 17 78 41 L78 45 Q60 39 42 45 Z" fill={c.trim} />
              <rect x="56" y="21" width="8" height="22" rx="3" fill={c.armorDark} />
            </g>
          )}
          {c.headgear === 'winged' && (
            <g stroke={STROKE} strokeWidth="1.3">
              <path d="M42 39 Q42 19 60 19 Q78 19 78 39 L78 31 Q60 25 42 31 Z" fill={c.trim} />
              <path d="M40 27 L27 21 L40 33 Z" fill="#fff" />
              <path d="M80 27 L93 21 L80 33 Z" fill="#fff" />
            </g>
          )}
          {c.headgear === 'crown' && (
            <path d="M45 27 L49 13 L56 23 L60 11 L64 23 L71 13 L75 27 Z" fill="#FFD24A" stroke="#B89400" strokeWidth="1" />
          )}
        </>
      )}
    </svg>
  );
}
