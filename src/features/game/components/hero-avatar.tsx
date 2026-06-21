'use client';

import { motion } from 'framer-motion';
import { RARITY, topRarity, type CharacterTier, type RarityKey } from '@/game-core';
import type { AvatarExpression, EquippedSlots } from '../types';

interface TierLook {
  armor: string; armorDark: string; trim: string;
  skin: string; hair: string; cape: string | null;
  pauldrons: boolean; weapon: 'none' | 'dagger' | 'sword' | 'greatsword';
  blade: string; headgear: 'hood' | 'band' | 'open-helm' | 'full-helm' | 'winged' | 'crown';
  aura: number; auraColor: string; eyeColor: string;
}

const LOOK: Record<CharacterTier, TierLook> = {
  initiate:   { armor: '#7A828F', armorDark: '#535B68', trim: '#9CA3AF', skin: '#F0C49B', hair: '#5A3E2B', cape: null,      pauldrons: false, weapon: 'none',       blade: '#C7CCD4', headgear: 'hood',      aura: 0,   auraColor: '#9CA3AF', eyeColor: '#6B8E7A' },
  apprentice: { armor: '#36A968', armorDark: '#227A49', trim: '#76E2A6', skin: '#F0C49B', hair: '#5A3E2B', cape: null,      pauldrons: false, weapon: 'dagger',     blade: '#D7DBE0', headgear: 'band',      aura: 0.3, auraColor: '#2ECC71', eyeColor: '#4A8C5C' },
  warrior:    { armor: '#4279EE', armorDark: '#2A50A8', trim: '#9DBBFF', skin: '#F0C49B', hair: '#5A3E2B', cape: '#2A50A8', pauldrons: true,  weapon: 'sword',      blade: '#DCE6FF', headgear: 'open-helm', aura: 0.5, auraColor: '#6C5CE7', eyeColor: '#4A7AB5' },
  veteran:    { armor: '#7B6CF0', armorDark: '#4B3FB0', trim: '#BCB1FF', skin: '#F0C49B', hair: '#5A3E2B', cape: '#4B3FB0', pauldrons: true,  weapon: 'sword',      blade: '#E7E1FF', headgear: 'full-helm', aura: 0.7, auraColor: '#6C5CE7', eyeColor: '#7A6ACA' },
  hero:       { armor: '#D8B43A', armorDark: '#9A7B16', trim: '#FFE07A', skin: '#F0C49B', hair: '#5A3E2B', cape: '#B03050', pauldrons: true,  weapon: 'greatsword', blade: '#FFF3C4', headgear: 'winged',    aura: 0.9, auraColor: '#FFD24A', eyeColor: '#C4903A' },
  legend:     { armor: '#F2CE2E', armorDark: '#BE9400', trim: '#FFF1B0', skin: '#F0C49B', hair: '#5A3E2B', cape: '#8A1538', pauldrons: true,  weapon: 'greatsword', blade: '#FFFAE0', headgear: 'crown',     aura: 1,   auraColor: '#FFD24A', eyeColor: '#E8C040' },
};

const SK = '#1a2030'; // stroke color

// Cape shapes for wind animation
const CA = 'M41 63 Q60 53 79 63 L91 138 L60 125 L29 138 Z';
const CB = 'M41 63 Q60 53 79 63 L87 140 L60 127 L21 137 Z';

const MOUTH: Record<AvatarExpression, string> = {
  idle:  'M55 47 Q60 50 65 47',
  happy: 'M53 46 Q60 53 67 46',
  angry: 'M55 49 Q60 45 65 49',
};
const BROWS: Record<AvatarExpression, [string, string]> = {
  idle:  ['M46 31 Q51 28 56 31', 'M64 31 Q69 28 74 31'],
  happy: ['M46 29 Q51 26 56 29', 'M64 29 Q69 26 74 29'],
  angry: ['M46 33 Q51 28 56 31', 'M64 31 Q69 28 74 33'],
};

export function HeroAvatar({
  tier, equipped, skinColor, hairColor, expression = 'idle',
}: {
  tier: CharacterTier; equipped?: EquippedSlots;
  skinColor?: string; hairColor?: string; expression?: AvatarExpression;
}) {
  const c = LOOK[tier];
  const skin = skinColor ?? c.skin;
  const hair = hairColor ?? c.hair;

  const hex = c.skin.replace('#', '');
  const skinShadow = `#${Math.max(0, parseInt(hex.slice(0,2),16)-38).toString(16).padStart(2,'0')}${Math.max(0,parseInt(hex.slice(2,4),16)-30).toString(16).padStart(2,'0')}${Math.max(0,parseInt(hex.slice(4,6),16)-20).toString(16).padStart(2,'0')}`;

  const eq = equipped ?? {};
  const rcol = (slot: string): string | null => { const it = eq[slot]; return it ? RARITY[it.rarity as RarityKey].color : null; };
  const ekey = (slot: string): string | null => eq[slot]?.key ?? null;

  const top = topRarity(Object.values(eq).filter(Boolean).map((it) => it!.rarity));
  const auraCol = top ? RARITY[top as RarityKey].color : c.auraColor;
  const auraOp = c.aura * 0.18 + (top ? 0.14 : 0);

  const capeColor = rcol('back') ?? c.cape;
  const handsItem = ekey('hands');
  const bladeColor = handsItem === 'volcano_blade' ? rcol('hands')! : c.blade;
  const gauntlet = handsItem === 'warrior_gloves' ? rcol('hands')! : c.armorDark;
  const showWeapon = c.weapon !== 'none' || (!!handsItem && handsItem !== 'sage_book');
  const isGreat = c.weapon === 'greatsword' || handsItem === 'volcano_blade';
  const bladeTopY = isGreat ? 32 : c.weapon === 'dagger' ? 60 : 42;

  const [browL, browR] = BROWS[expression];

  // unique gradient ids per tier to avoid cross-instance conflicts
  const fid = `f-${tier}`, aid = `a-${tier}`, cid = `c-${tier}`, bid = `b-${tier}`, hid = `h-${tier}`;

  return (
    <svg viewBox="0 0 120 168" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        {/* Skin radial — light upper-left */}
        <radialGradient id={fid} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor={skin} />
          <stop offset="62%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>
        {/* Armor linear — highlight at top */}
        <linearGradient id={aid} x1="0.1" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor={c.trim} stopOpacity="0.55" />
          <stop offset="18%" stopColor={c.armor} />
          <stop offset="82%" stopColor={c.armorDark} />
          <stop offset="100%" stopColor={SK} stopOpacity="0.7" />
        </linearGradient>
        {/* Blade — center highlight */}
        <linearGradient id={bid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={bladeColor} stopOpacity="0.45" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="100%" stopColor={bladeColor} stopOpacity="0.38" />
        </linearGradient>
        {/* Cape */}
        {capeColor && (
          <linearGradient id={cid} x1="0.2" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={capeColor} />
            <stop offset="55%" stopColor={capeColor} stopOpacity="0.88" />
            <stop offset="100%" stopColor={SK} stopOpacity="0.65" />
          </linearGradient>
        )}
        {/* Hair highlight streak */}
        <linearGradient id={hid} x1="0.3" y1="0" x2="0.05" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Aura radial */}
        <radialGradient id={`au-${tier}`} cx="50%" cy="52%" r="50%">
          <stop offset="0%" stopColor={auraCol} stopOpacity={Math.min(auraOp * 2.2, 0.6)} />
          <stop offset="100%" stopColor={auraCol} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── AURA GLOW ─────────────────────────────────────────── */}
      {auraOp > 0 && (
        <motion.ellipse cx="60" cy="90" rx="52" ry="62"
          fill={`url(#au-${tier})`}
          animate={{ opacity: [0.7, 1, 0.7], ry: [60, 66, 60] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ── GROUND SHADOW ─────────────────────────────────────── */}
      <ellipse cx="60" cy="161" rx="30" ry="5.5" fill="#000" opacity="0.28" />

      {/* ── CAPE ──────────────────────────────────────────────── */}
      {capeColor && (
        <>
          <motion.path fill={`url(#${cid})`} stroke={SK} strokeWidth="1.3"
            animate={{ d: [CA, CB, CA] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Fold lines */}
          <motion.path d="M51 68 Q49 98 47 132" stroke={SK} strokeWidth="0.9" fill="none" opacity="0.3"
            animate={{ d: ['M51 68 Q49 98 47 132','M51 68 Q47 98 43 133','M51 68 Q49 98 47 132'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M70 68 Q72 98 74 133" stroke={capeColor} strokeWidth="0.9" fill="none" opacity="0.28"
            animate={{ d: ['M70 68 Q72 98 74 133','M70 68 Q74 98 77 135','M70 68 Q72 98 74 133'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Inner lining edge */}
          <motion.path d="M60 66 Q62 100 64 133" stroke={c.trim} strokeWidth="0.7" fill="none" opacity="0.22"
            animate={{ d: ['M60 66 Q62 100 64 133','M60 66 Q63 102 65 135','M60 66 Q62 100 64 133'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
        </>
      )}

      {/* ── LEGS ──────────────────────────────────────────────── */}
      {/* Left thigh */}
      <path d="M49 107 Q46 108 45 114 L44 128 Q44 132 48 133 L55 133 Q58 131 58 127 L58 107 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.3" />
      <path d="M46 113 L46 129" stroke={c.trim} strokeWidth="0.9" opacity="0.35" />
      {/* Left knee guard */}
      <ellipse cx="51" cy="120" rx="7" ry="5.5" fill={c.trim} stroke={SK} strokeWidth="1.2" />
      <ellipse cx="51" cy="120" rx="4.5" ry="3.5" fill={c.armor} />
      <path d="M47 119 Q51 116 55 119" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.4" />
      {/* Left boot */}
      <path d="M43 130 Q41 137 41 141 L56 141 Q59 139 59 134 L58 130 Z" fill={rcol('feet') ?? '#3a2918'} stroke={SK} strokeWidth="1.3" />
      <path d="M39 139 Q39 144 46 145 L57 145 Q60 143 60 140 L39 140 Z" fill={rcol('feet') ?? '#2a1e10'} stroke={SK} strokeWidth="1.2" />
      <path d="M44 133 L57 133" stroke={c.trim} strokeWidth="0.9" opacity="0.45" />
      <path d="M42 137 L57 137" stroke={c.trim} strokeWidth="0.7" opacity="0.3" />

      {/* Right thigh */}
      <path d="M71 107 Q74 108 75 114 L76 128 Q76 132 72 133 L65 133 Q62 131 62 127 L62 107 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.3" />
      <path d="M74 113 L74 129" stroke={c.trim} strokeWidth="0.9" opacity="0.35" />
      {/* Right knee guard */}
      <ellipse cx="69" cy="120" rx="7" ry="5.5" fill={c.trim} stroke={SK} strokeWidth="1.2" />
      <ellipse cx="69" cy="120" rx="4.5" ry="3.5" fill={c.armor} />
      <path d="M65 119 Q69 116 73 119" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.4" />
      {/* Right boot */}
      <path d="M77 130 Q79 137 79 141 L64 141 Q61 139 61 134 L62 130 Z" fill={rcol('feet') ?? '#3a2918'} stroke={SK} strokeWidth="1.3" />
      <path d="M81 139 Q81 144 74 145 L63 145 Q60 143 60 140 L81 140 Z" fill={rcol('feet') ?? '#2a1e10'} stroke={SK} strokeWidth="1.2" />
      <path d="M63 133 L78 133" stroke={c.trim} strokeWidth="0.9" opacity="0.45" />
      <path d="M63 137 L78 137" stroke={c.trim} strokeWidth="0.7" opacity="0.3" />

      {/* ── LEFT ARM ──────────────────────────────────────────── */}
      <path d="M30 63 Q26 65 25 73 L25 88 Q25 97 29 101 L36 101 Q40 97 40 88 L40 67 Q38 62 34 62 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.3" />
      <path d="M27 70 L27 86" stroke={c.trim} strokeWidth="1" opacity="0.3" />
      {/* Elbow guard */}
      <ellipse cx="32" cy="90" rx="7.5" ry="6" fill={c.trim} stroke={SK} strokeWidth="1.2" />
      <ellipse cx="32" cy="90" rx="4.5" ry="3.8" fill={c.armor} />
      {/* Vambrace */}
      <path d="M27 97 Q25 100 25 106 L26 111 Q28 114 33 114 L37 114 Q40 112 40 108 L40 99 Q38 96 35 96 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.2" />
      <path d="M26 100 L26 110" stroke={c.trim} strokeWidth="1.1" opacity="0.38" />
      {/* Gauntlet */}
      <ellipse cx="33" cy="116" rx="7.5" ry="5.5" fill={gauntlet} stroke={SK} strokeWidth="1.3" />
      <path d="M26 116 Q26 121 33 122 Q40 121 40 116" fill={gauntlet} stroke={SK} strokeWidth="1.2" />
      <path d="M28 116 L28 121 M31.5 116 L31.5 122 M35 116 L35 122 M38.5 116 L38.5 120"
        stroke={SK} strokeWidth="0.8" opacity="0.45" />

      {/* Accessory */}
      {ekey('accessory') === 'legendary_bottle' && (
        <g stroke={SK} strokeWidth="1.2">
          <rect x="27" y="101" width="9" height="13" rx="3" fill={rcol('accessory')!} />
          <rect x="30" y="96" width="3" height="6" fill={rcol('accessory')!} />
          <path d="M28 106 L35 106" stroke="#fff" strokeWidth="0.7" opacity="0.38" />
        </g>
      )}
      {ekey('accessory') === 'cave_lantern' && (
        <g stroke={SK} strokeWidth="1.2">
          <rect x="27" y="101" width="10" height="11" rx="2" fill="#2a3340" />
          <rect x="29" y="103" width="6" height="7" rx="1" fill={rcol('accessory')!} />
          <path d="M32 97 L32 101" /><circle cx="32" cy="97" r="2" fill={rcol('accessory')!} opacity="0.7" />
        </g>
      )}
      {ekey('accessory') === 'forest_charm' && (
        <g stroke={SK} strokeWidth="1.2">
          <line x1="33" y1="97" x2="33" y2="103" />
          <path d="M33 103 l5 4 l-5 5 l-5 -5 z" fill={rcol('accessory')!} />
        </g>
      )}
      {handsItem === 'sage_book' && (
        <g stroke={SK} strokeWidth="1.3">
          <rect x="24" y="106" width="17" height="13" rx="2" fill={rcol('hands')!} />
          <rect x="32.5" y="106" width="1.5" height="13" fill="#fff" opacity="0.5" />
          <path d="M26 109 L30 109 M26 112 L30 112 M26 115 L30 115" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
        </g>
      )}

      {/* ── TORSO ─────────────────────────────────────────────── */}
      <path d="M40 61 Q60 52 80 61 L79 109 Q60 119 41 109 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.6" />
      {/* Chest highlight panel */}
      <path d="M43 65 Q52 58 58 64 L57 92 Q52 96 44 93 Z" fill={c.armor} opacity="0.32" />
      {/* Center keel */}
      <path d="M60 59 L60 109" stroke={SK} strokeWidth="1.2" opacity="0.45" />
      {/* Pec lines */}
      <path d="M44 73 Q52 69 60 73 M60 73 Q68 69 76 73" stroke={SK} strokeWidth="0.9" fill="none" opacity="0.35" />
      {/* Abs bands */}
      <path d="M46 90 Q60 86 74 90" stroke={SK} strokeWidth="0.9" fill="none" opacity="0.3" />
      <path d="M46 97 Q60 93 74 97" stroke={SK} strokeWidth="0.9" fill="none" opacity="0.3" />
      {/* Collar trim */}
      <path d="M43 65 Q60 57 77 65" stroke={c.trim} strokeWidth="1.5" fill="none" opacity="0.65" />
      {/* Center gem / motif */}
      <path d="M57 71 Q60 67 63 71 Q60 75 57 71 Z" fill={c.trim} opacity="0.55" />

      {/* Belt */}
      <rect x="41" y="102" width="38" height="8.5" rx="4" fill="#3d2b18" stroke={SK} strokeWidth="1.2" />
      <rect x="55.5" y="103.5" width="9" height="6" rx="1.5" fill={c.trim} stroke={SK} strokeWidth="1" />
      <rect x="57.5" y="105" width="5" height="3.5" rx="0.8" fill={c.armorDark} />
      <rect x="43" y="104" width="6" height="5" rx="1.5" fill="#4a3520" stroke={SK} strokeWidth="0.9" />
      <rect x="71" y="104" width="6" height="5" rx="1.5" fill="#4a3520" stroke={SK} strokeWidth="0.9" />

      {/* Chest item */}
      {ekey('chest') === 'temple_relic' ? (
        <path d="M60 79 l6 6 l-6 7 l-6 -7 z" fill={rcol('chest')!} stroke={SK} strokeWidth="1.3" />
      ) : rcol('chest') ? (
        <g>
          <circle cx="60" cy="83" r="7.5" fill={rcol('chest')!} stroke={SK} strokeWidth="1.4" />
          <circle cx="60" cy="83" r="3" fill="#fff" opacity="0.88" />
          <circle cx="58.5" cy="81.5" r="1.1" fill="#fff" opacity="0.55" />
        </g>
      ) : null}

      {/* ── PAULDRONS ─────────────────────────────────────────── */}
      {c.pauldrons ? (
        <>
          <ellipse cx="37" cy="62" rx="13" ry="9.5" fill={c.trim} stroke={SK} strokeWidth="1.4" />
          <ellipse cx="37" cy="62" rx="9" ry="6.5" fill={c.armor} stroke={SK} strokeWidth="0.8" />
          <path d="M26 67 Q28 75 34 77" stroke={c.trim} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M25 68 Q23 77 28 82 L36 80 Q39 76 37 67 Z" fill={c.armorDark} stroke={SK} strokeWidth="1.2" />
          <ellipse cx="83" cy="62" rx="13" ry="9.5" fill={c.trim} stroke={SK} strokeWidth="1.4" />
          <ellipse cx="83" cy="62" rx="9" ry="6.5" fill={c.armor} stroke={SK} strokeWidth="0.8" />
          <path d="M94 67 Q92 75 86 77" stroke={c.trim} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M95 68 Q97 77 92 82 L84 80 Q81 76 83 67 Z" fill={c.armorDark} stroke={SK} strokeWidth="1.2" />
        </>
      ) : (
        <>
          <ellipse cx="39" cy="63" rx="9" ry="7" fill={c.trim} stroke={SK} strokeWidth="1.2" />
          <ellipse cx="81" cy="63" rx="9" ry="7" fill={c.trim} stroke={SK} strokeWidth="1.2" />
        </>
      )}

      {/* ── RIGHT ARM ─────────────────────────────────────────── */}
      <path d="M90 63 Q94 65 95 73 L95 88 Q95 97 91 101 L84 101 Q80 97 80 88 L80 67 Q82 62 86 62 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.3" />
      <path d="M93 70 L93 86" stroke={c.trim} strokeWidth="1" opacity="0.3" />
      {/* Elbow guard */}
      <ellipse cx="88" cy="90" rx="7.5" ry="6" fill={c.trim} stroke={SK} strokeWidth="1.2" />
      <ellipse cx="88" cy="90" rx="4.5" ry="3.8" fill={c.armor} />
      {/* Vambrace */}
      <path d="M83 97 Q81 100 81 106 L82 111 Q84 114 89 114 L92 114 Q95 112 95 108 L95 99 Q93 96 90 96 Z"
        fill={`url(#${aid})`} stroke={SK} strokeWidth="1.2" />
      <path d="M94 100 L94 110" stroke={c.trim} strokeWidth="1.1" opacity="0.38" />
      {/* Gauntlet */}
      <ellipse cx="88" cy="116" rx="7.5" ry="5.5" fill={gauntlet} stroke={SK} strokeWidth="1.3" />
      <path d="M81 116 Q81 121 88 122 Q95 121 95 116" fill={gauntlet} stroke={SK} strokeWidth="1.2" />
      <path d="M83 116 L83 121 M86.5 116 L86.5 122 M90 116 L90 122 M93.5 116 L93.5 120"
        stroke={SK} strokeWidth="0.8" opacity="0.45" />

      {/* ── WEAPON ────────────────────────────────────────────── */}
      {showWeapon && (
        <g>
          {c.weapon === 'dagger' ? (
            <>
              <path d="M87 94 L85 55 L88 49 L91 55 L89 94 Z" fill={`url(#${bid})`} stroke={SK} strokeWidth="1.2" />
              <line x1="88" y1="53" x2="88" y2="91" stroke="#fff" strokeWidth="0.9" opacity="0.48" />
              <rect x="82" y="93" width="12" height="3.5" rx="1.5" fill={c.trim} stroke={SK} strokeWidth="1.1" />
              <rect x="85.5" y="96" width="5" height="9" rx="2" fill="#6b4a2b" stroke={SK} strokeWidth="1" />
              <path d="M86 97 L86 104 M88 96.5 L88 105 M90 97 L90 104" stroke="#8a6540" strokeWidth="0.6" opacity="0.55" />
              <circle cx="88" cy="106" r="2.8" fill={c.trim} stroke={SK} strokeWidth="1" />
            </>
          ) : isGreat ? (
            <>
              <path d={`M87 94 L84 ${bladeTopY + 6} L88 ${bladeTopY} L92 ${bladeTopY + 6} L89 94 Z`}
                fill={`url(#${bid})`} stroke={SK} strokeWidth="1.3" />
              <line x1="88" y1={bladeTopY + 4} x2="88" y2="91" stroke="#fff" strokeWidth="1.2" opacity="0.52" />
              {/* Crossguard */}
              <path d="M77 91 Q80 88 88 88 Q96 88 99 91 Q96 94 88 94 Q80 94 77 91 Z"
                fill={c.trim} stroke={SK} strokeWidth="1.3" />
              <path d="M79 91 L77 95" stroke={SK} strokeWidth="1" /><path d="M97 91 L99 95" stroke={SK} strokeWidth="1" />
              {/* Grip */}
              <rect x="85.5" y="93" width="5" height="13" rx="2.5" fill="#5a3e1e" stroke={SK} strokeWidth="1" />
              <path d="M86 94.5 L86 105.5 M88 94 L88 106 M90.5 94.5 L90.5 105.5" stroke="#7a5a2e" strokeWidth="0.7" opacity="0.55" />
              {/* Pommel */}
              <path d="M86 106 Q88 103 90 106 Q88 111 86 106 Z" fill={c.trim} stroke={SK} strokeWidth="1.1" />
              <circle cx="88" cy="112" r="4" fill={c.trim} stroke={SK} strokeWidth="1.2" />
              <circle cx="88" cy="112" r="2.2" fill={c.armorDark} />
              <circle cx="87" cy="111" r="0.8" fill="#fff" opacity="0.6" />
            </>
          ) : (
            <>
              {/* Standard sword */}
              <path d={`M87 93 L85 ${bladeTopY + 4} L88 ${bladeTopY} L91 ${bladeTopY + 4} L89 93 Z`}
                fill={`url(#${bid})`} stroke={SK} strokeWidth="1.2" />
              <line x1="88" y1={bladeTopY + 3} x2="88" y2="90" stroke="#fff" strokeWidth="1" opacity="0.5" />
              <path d="M79 90 Q82 87 88 87 Q94 87 97 90 Q94 93 88 93 Q82 93 79 90 Z"
                fill={c.trim} stroke={SK} strokeWidth="1.2" />
              <path d="M81 90 L79 94" stroke={SK} strokeWidth="1" /><path d="M95 90 L97 94" stroke={SK} strokeWidth="1" />
              <rect x="85.5" y="92" width="5" height="11" rx="2" fill="#6b4a2b" stroke={SK} strokeWidth="1" />
              <path d="M86 93 L86 102 M88 92.5 L88 103 M90 93 L90 102" stroke="#8a6540" strokeWidth="0.7" opacity="0.55" />
              <circle cx="88" cy="104" r="3.2" fill={c.trim} stroke={SK} strokeWidth="1.2" />
              <circle cx="88" cy="104" r="1.7" fill={c.armorDark} />
              <circle cx="87" cy="103" r="0.7" fill="#fff" opacity="0.55" />
            </>
          )}
          {/* Blade shimmer */}
          <motion.line
            x1="88" y1={bladeTopY + 5} x2="88" y2="89" stroke="#fff" strokeWidth="1.6"
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
          />
        </g>
      )}

      {/* ── NECK ──────────────────────────────────────────────── */}
      <path d="M54 49 Q54 56 55 58 L65 58 Q66 56 66 49 Z" fill={`url(#${fid})`} stroke={SK} strokeWidth="1.2" />
      <path d="M63 50 Q65 53 64 58" stroke={skinShadow} strokeWidth="1.5" fill="none" opacity="0.35" />
      {/* Gorget */}
      <path d="M44 61 Q52 55 60 54 Q68 55 76 61 L74 66 Q60 62 46 66 Z"
        fill={c.armor} stroke={SK} strokeWidth="1.2" opacity="0.82" />
      <path d="M46 63 Q60 59 74 63" stroke={c.trim} strokeWidth="0.8" fill="none" opacity="0.45" />

      {/* ── HEAD ──────────────────────────────────────────────── */}
      <path d="M40 36 Q40 16 60 15 Q80 16 80 36 Q80 49 70 53 Q60 56 50 53 Q40 49 40 36 Z"
        fill={`url(#${fid})`} stroke={SK} strokeWidth="1.6" />
      {/* Temple shadows */}
      <path d="M41 35 Q40 43 43 49" stroke={skinShadow} strokeWidth="3" fill="none" opacity="0.2" />
      <path d="M79 35 Q80 43 77 49" stroke={skinShadow} strokeWidth="3" fill="none" opacity="0.18" />

      {/* Ears */}
      <ellipse cx="40" cy="37" rx="3.5" ry="4.8" fill={`url(#${fid})`} stroke={SK} strokeWidth="1.2" />
      <path d="M40 33 Q37 35 37 37 Q37 39 40 41" stroke={skinShadow} strokeWidth="1.1" fill="none" opacity="0.38" />
      <ellipse cx="80" cy="37" rx="3.5" ry="4.8" fill={`url(#${fid})`} stroke={SK} strokeWidth="1.2" />
      <path d="M80 33 Q83 35 83 37 Q83 39 80 41" stroke={skinShadow} strokeWidth="1.1" fill="none" opacity="0.35" />

      {/* ── HAIR ──────────────────────────────────────────────── */}
      {(c.headgear === 'hood' || c.headgear === 'band' || c.headgear === 'crown')
        && ekey('head') !== 'mountain_horn' && (
        <>
          <path d="M42 34 Q43 17 60 16 Q77 17 78 34 Q72 25 60 25 Q48 25 42 34 Z"
            fill={hair} stroke={SK} strokeWidth="1" />
          <path d="M42 34 Q40 42 42 49" fill={hair} stroke="none" />
          <path d="M78 34 Q80 42 78 49" fill={hair} stroke="none" />
          {/* Highlight streak */}
          <path d="M49 19 Q57 15 64 19 Q60 21 55 20 Z" fill={`url(#${hid})`} />
          {/* Strands */}
          <path d="M46 21 Q47 28 45 34" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.22" />
          <path d="M55 17 Q54 24 52 31" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.18" />
          <path d="M65 17 Q66 24 68 31" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.18" />
          <path d="M72 21 Q73 28 75 34" stroke={SK} strokeWidth="0.7" fill="none" opacity="0.2" />
        </>
      )}

      {/* ── EYEBROWS ──────────────────────────────────────────── */}
      <path d={browL} stroke={hair} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={browR} stroke={hair} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M46 33 Q51 31 56 33" stroke={skinShadow} strokeWidth="1.5" fill="none" opacity="0.18" />
      <path d="M64 33 Q69 31 74 33" stroke={skinShadow} strokeWidth="1.5" fill="none" opacity="0.16" />

      {/* ── EYES ──────────────────────────────────────────────── */}
      {/* Left */}
      <ellipse cx="53" cy="38" rx="5.2" ry="4.2" fill="#fff" stroke={SK} strokeWidth="0.8" />
      <circle cx="53.6" cy="38.2" r="3" fill={c.eyeColor} />
      <circle cx="53.6" cy="38.2" r="1.7" fill="#14182a" />
      <circle cx="52.4" cy="36.9" r="1" fill="#fff" opacity="0.92" />
      <circle cx="54.5" cy="39.4" r="0.45" fill="#fff" opacity="0.5" />
      <path d="M48 35.5 Q53 33 58 35.5" stroke={SK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M48.5 40.8 Q53 42.5 57.5 40.8" stroke={skinShadow} strokeWidth="0.9" fill="none" opacity="0.45" />
      {/* Right */}
      <ellipse cx="67" cy="38" rx="5.2" ry="4.2" fill="#fff" stroke={SK} strokeWidth="0.8" />
      <circle cx="67.6" cy="38.2" r="3" fill={c.eyeColor} />
      <circle cx="67.6" cy="38.2" r="1.7" fill="#14182a" />
      <circle cx="66.4" cy="36.9" r="1" fill="#fff" opacity="0.92" />
      <circle cx="68.5" cy="39.4" r="0.45" fill="#fff" opacity="0.5" />
      <path d="M62 35.5 Q67 33 72 35.5" stroke={SK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M62.5 40.8 Q67 42.5 71.5 40.8" stroke={skinShadow} strokeWidth="0.9" fill="none" opacity="0.45" />

      {/* Blink */}
      <motion.ellipse cx="53" cy="38" rx="5.2" ry="0"
        fill={`url(#${fid})`}
        animate={{ ry: [0, 0, 4.2, 0] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.84, 0.92, 1], ease: 'easeInOut' }}
      />
      <motion.ellipse cx="67" cy="38" rx="5.2" ry="0"
        fill={`url(#${fid})`}
        animate={{ ry: [0, 0, 4.2, 0] }}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.84, 0.92, 1], ease: 'easeInOut' }}
      />

      {/* ── NOSE ──────────────────────────────────────────────── */}
      <path d="M58.5 33 L57.5 44" stroke={skinShadow} strokeWidth="1.2" fill="none" opacity="0.18" strokeLinecap="round" />
      <path d="M61.5 33 L62.5 44" stroke={skinShadow} strokeWidth="1.2" fill="none" opacity="0.16" strokeLinecap="round" />
      <path d="M55.5 44 Q57.5 47.5 60 47.5 Q62.5 47.5 64.5 44 Q62.5 46 60 46 Q57.5 46 55.5 44 Z"
        fill={skinShadow} opacity="0.32" />
      <ellipse cx="57.5" cy="45.8" rx="1.4" ry="0.9" fill={skinShadow} opacity="0.42" />
      <ellipse cx="62.5" cy="45.8" rx="1.4" ry="0.9" fill={skinShadow} opacity="0.42" />

      {/* ── MOUTH ─────────────────────────────────────────────── */}
      <path d="M55.5 47.8 Q57.5 46.2 60 46.2 Q62.5 46.2 64.5 47.8 Q62 47 60 47 Q58 47 55.5 47.8 Z"
        fill={skinShadow} opacity="0.38" />
      <path d={MOUTH[expression]} stroke="#b06a4a" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <path d="M55.5 47.8 Q60 49.5 64.5 47.8" stroke="#8a4a3a" strokeWidth="0.9" fill="none" opacity="0.42" />
      {expression === 'happy' && (
        <>
          <path d="M55.5 47.5 Q60 52 64.5 47.5 Q60 53 55.5 47.5 Z" fill="#fff" opacity="0.78" />
          <ellipse cx="47.5" cy="43.5" rx="5" ry="3" fill="#FF9090" opacity="0.28" />
          <ellipse cx="72.5" cy="43.5" rx="5" ry="3" fill="#FF9090" opacity="0.28" />
        </>
      )}

      {/* ── HEADGEAR ──────────────────────────────────────────── */}
      {ekey('head') === 'mountain_horn' ? (
        <g fill={rcol('head')!} stroke={SK} strokeWidth="1.2">
          <path d="M44 27 Q36 23 33 10 Q41 14 47 25 Z" />
          <path d="M76 27 Q84 23 87 10 Q79 14 73 25 Z" />
          <path d="M47 25 Q45 31 47 35" stroke={SK} fill="none" strokeWidth="1.1" />
          <path d="M73 25 Q75 31 73 35" stroke={SK} fill="none" strokeWidth="1.1" />
        </g>
      ) : ekey('head') ? (
        <path d="M45 27 L49 12 L56 23 L60 9 L64 23 L71 12 L75 27 Z" fill={rcol('head')!} stroke={SK} strokeWidth="1.2" />
      ) : (
        <>
          {c.headgear === 'hood' && (
            <>
              <path d="M40 40 Q39 17 60 15 Q81 17 80 40 Q80 28 70 23 L50 23 Q40 28 40 40 Z"
                fill={c.armorDark} stroke={SK} strokeWidth="1.4" />
              <path d="M40 40 Q41 30 45 25" stroke={SK} strokeWidth="1.1" fill="none" opacity="0.38" />
              <path d="M80 40 Q79 30 75 25" stroke={c.armorDark} strokeWidth="1.2" fill="none" opacity="0.35" />
            </>
          )}
          {c.headgear === 'band' && (
            <>
              <rect x="41" y="27" width="38" height="7.5" rx="3.5" fill={c.trim} stroke={SK} strokeWidth="1.2" />
              <path d="M43 29.5 L77 29.5" stroke="#fff" strokeWidth="0.8" opacity="0.22" />
              <circle cx="60" cy="31" r="2.8" fill={c.armor} stroke={SK} strokeWidth="0.9" />
              <circle cx="60" cy="31" r="1.2" fill={c.trim} />
            </>
          )}
          {c.headgear === 'open-helm' && (
            <>
              <path d="M40 43 Q40 17 60 15 Q80 17 80 43 L80 31 Q60 22 40 31 Z"
                fill={c.trim} stroke={SK} strokeWidth="1.4" />
              <rect x="58" y="31" width="4" height="13" rx="1.5" fill={c.armorDark} stroke={SK} strokeWidth="0.9" />
              <path d="M40 36 L40 49 Q44 53 48 51 L44 38 Z" fill={c.armorDark} stroke={SK} strokeWidth="1" />
              <path d="M80 36 L80 49 Q76 53 72 51 L76 38 Z" fill={c.armorDark} stroke={SK} strokeWidth="1" />
              <path d="M42 19 Q51 16 60 15" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.18" />
            </>
          )}
          {c.headgear === 'full-helm' && (
            <>
              <path d="M40 44 Q40 15 60 14 Q80 15 80 44 L80 49 Q60 41 40 49 Z"
                fill={c.trim} stroke={SK} strokeWidth="1.4" />
              <rect x="52" y="33" width="16" height="3.5" rx="1.5" fill={SK} opacity="0.82" />
              <rect x="58" y="21" width="4" height="20" rx="1.8" fill={c.armorDark} stroke={SK} strokeWidth="0.9" />
              <path d="M40 38 L40 51 Q45 56 50 53 L46 39 Z" fill={c.armorDark} stroke={SK} strokeWidth="1.1" />
              <path d="M80 38 L80 51 Q75 56 70 53 L74 39 Z" fill={c.armorDark} stroke={SK} strokeWidth="1.1" />
              <path d="M42 18 Q51 13 60 13" stroke="#fff" strokeWidth="2" fill="none" opacity="0.16" />
              <path d="M42 25 L42 42" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.1" />
            </>
          )}
          {c.headgear === 'winged' && (
            <>
              <path d="M40 43 Q40 17 60 15 Q80 17 80 43 L80 31 Q60 22 40 31 Z"
                fill={c.trim} stroke={SK} strokeWidth="1.4" />
              <path d="M39 28 L20 14 L38 37 Z" fill="#fff" stroke={SK} strokeWidth="1.1" />
              <path d="M81 28 L100 14 L82 37 Z" fill="#fff" stroke={SK} strokeWidth="1.1" />
              <path d="M36 27 L22 17 M35 32 L21 22 M34 36 L25 30"
                stroke={SK} strokeWidth="0.7" fill="none" opacity="0.35" />
              <path d="M84 27 L98 17 M85 32 L99 22 M86 36 L95 30"
                stroke={SK} strokeWidth="0.7" fill="none" opacity="0.35" />
              <path d="M42 19 Q51 16 60 15" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.2" />
            </>
          )}
          {c.headgear === 'crown' && (
            <>
              <path d="M44 27 L48 11 L55 23 L60 8 L65 23 L72 11 L76 27 Z"
                fill="#FFD24A" stroke="#B89400" strokeWidth="1.2" />
              <circle cx="60" cy="13" r="2.8" fill="#FF4466" opacity="0.92" />
              <circle cx="51.5" cy="20" r="2" fill="#44AAFF" opacity="0.9" />
              <circle cx="68.5" cy="20" r="2" fill="#44FF99" opacity="0.9" />
              <path d="M47 24 L50 12" stroke="#fff" strokeWidth="1.3" fill="none" opacity="0.32" />
              <path d="M60 24 L60 11" stroke="#fff" strokeWidth="1.3" fill="none" opacity="0.32" />
              <path d="M44 27 L76 27" stroke="#B89400" strokeWidth="1" fill="none" opacity="0.7" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
