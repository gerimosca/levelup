/**
 * Catálogo de equipamiento cosmético (todo desbloqueable, cero compras).
 * Ver docs/design/02-game-design.md §8.
 */
import type { EquipmentDef } from '../types';

/** Equipo que se desbloquea con LOGROS (trabajo/constancia). */
export const ACHIEVEMENT_EQUIPMENT: EquipmentDef[] = [
  { key: 'legendary_bottle', slot: 'accessory', rarity: 'rare', source: 'achievement', unlockKey: 'equipment.legendary_bottle.unlock', unlockedBy: 'clean_7' },
  { key: 'sage_book', slot: 'hands', rarity: 'epic', source: 'achievement', unlockKey: 'equipment.sage_book.unlock', unlockedBy: 'reads_100' },
  { key: 'explorer_boots', slot: 'feet', rarity: 'rare', source: 'achievement', unlockKey: 'equipment.explorer_boots.unlock', unlockedBy: 'km_50' },
  { key: 'warrior_gloves', slot: 'hands', rarity: 'epic', source: 'achievement', unlockKey: 'equipment.warrior_gloves.unlock', unlockedBy: 'trainings_100' },
  { key: 'constancy_medal', slot: 'chest', rarity: 'legendary', source: 'achievement', unlockKey: 'equipment.constancy_medal.unlock', unlockedBy: 'streak_100' },
  { key: 'reborn_cape', slot: 'back', rarity: 'epic', source: 'achievement', unlockKey: 'equipment.reborn_cape.unlock', unlockedBy: 'season_1_done' },
  { key: 'discipline_crown', slot: 'head', rarity: 'legendary', source: 'achievement', unlockKey: 'equipment.discipline_crown.unlock', unlockedBy: 'all_seasons' },
];

/**
 * Loot de COFRES (cosmético, NUNCA da XP).
 * S1 (índices 0-6, 7 cofres): forest → castle.
 * S2 (índices 7-12, 6 cofres): plains → glacier.
 * S3 (índices 13-18, 6 cofres): desert → spire.
 * S4 (índices 19-25, 7 cofres): sanctum → astral.
 * handleOpenChest aplica el offset de temporada para elegir el índice correcto.
 */
export const CHEST_LOOT: EquipmentDef[] = [
  // ─── S1 · RESET (7 zonas) ─────────────────────────────────────────────────
  { key: 'forest_charm',    slot: 'accessory', rarity: 'common', source: 'chest', unlockKey: 'equipment.forest_charm.unlock',    unlockedBy: '' },
  { key: 'mountain_horn',   slot: 'head',      rarity: 'common', source: 'chest', unlockKey: 'equipment.mountain_horn.unlock',   unlockedBy: '' },
  { key: 'cave_lantern',    slot: 'accessory', rarity: 'rare',   source: 'chest', unlockKey: 'equipment.cave_lantern.unlock',    unlockedBy: '' },
  { key: 'volcano_blade',   slot: 'hands',     rarity: 'rare',   source: 'chest', unlockKey: 'equipment.volcano_blade.unlock',   unlockedBy: '' },
  { key: 'temple_relic',    slot: 'chest',     rarity: 'epic',   source: 'chest', unlockKey: 'equipment.temple_relic.unlock',    unlockedBy: '' },
  { key: 'city_cloak',      slot: 'back',      rarity: 'rare',   source: 'chest', unlockKey: 'equipment.city_cloak.unlock',      unlockedBy: '' },
  { key: 'castle_greaves',  slot: 'feet',      rarity: 'epic',   source: 'chest', unlockKey: 'equipment.castle_greaves.unlock',  unlockedBy: '' },
  // ─── S2 · STRENGTH (6 zonas con cofre: plains→glacier) ───────────────────
  { key: 'plains_band',     slot: 'accessory', rarity: 'common', source: 'chest', unlockKey: 'equipment.plains_band.unlock',     unlockedBy: '' },
  { key: 'hills_cloak',     slot: 'back',      rarity: 'common', source: 'chest', unlockKey: 'equipment.hills_cloak.unlock',     unlockedBy: '' },
  { key: 'gorge_helm',      slot: 'head',      rarity: 'rare',   source: 'chest', unlockKey: 'equipment.gorge_helm.unlock',      unlockedBy: '' },
  { key: 'highlands_boots', slot: 'feet',      rarity: 'rare',   source: 'chest', unlockKey: 'equipment.highlands_boots.unlock', unlockedBy: '' },
  { key: 'ridge_gauntlets', slot: 'hands',     rarity: 'epic',   source: 'chest', unlockKey: 'equipment.ridge_gauntlets.unlock', unlockedBy: '' },
  { key: 'glacier_plate',   slot: 'chest',     rarity: 'epic',   source: 'chest', unlockKey: 'equipment.glacier_plate.unlock',   unlockedBy: '' },
  // ─── S3 · CUT (6 zonas con cofre: desert→spire) ──────────────────────────
  { key: 'desert_sigil',    slot: 'accessory', rarity: 'rare',   source: 'chest', unlockKey: 'equipment.desert_sigil.unlock',    unlockedBy: '' },
  { key: 'oasis_veil',      slot: 'back',      rarity: 'rare',   source: 'chest', unlockKey: 'equipment.oasis_veil.unlock',      unlockedBy: '' },
  { key: 'dune_sabatons',   slot: 'feet',      rarity: 'epic',   source: 'chest', unlockKey: 'equipment.dune_sabatons.unlock',   unlockedBy: '' },
  { key: 'mesa_plate',      slot: 'chest',     rarity: 'epic',   source: 'chest', unlockKey: 'equipment.mesa_plate.unlock',      unlockedBy: '' },
  { key: 'canyon_gauntlets',slot: 'hands',     rarity: 'legendary', source: 'chest', unlockKey: 'equipment.canyon_gauntlets.unlock', unlockedBy: '' },
  { key: 'zenith_helm',     slot: 'head',      rarity: 'legendary', source: 'chest', unlockKey: 'equipment.zenith_helm.unlock',     unlockedBy: '' },
  // ─── S4 · DISCIPLINE (6 zonas con cofre: sanctum→astral) ─────────────────
  { key: 'sanctum_sash',    slot: 'accessory', rarity: 'mythic', source: 'chest', unlockKey: 'equipment.sanctum_sash.unlock',    unlockedBy: '' },
  { key: 'labyrinth_mantle',slot: 'back',      rarity: 'mythic', source: 'chest', unlockKey: 'equipment.labyrinth_mantle.unlock',unlockedBy: '' },
  { key: 'abyss_greaves',   slot: 'feet',      rarity: 'mythic', source: 'chest', unlockKey: 'equipment.abyss_greaves.unlock',   unlockedBy: '' },
  { key: 'void_plate',      slot: 'chest',     rarity: 'mythic', source: 'chest', unlockKey: 'equipment.void_plate.unlock',      unlockedBy: '' },
  { key: 'dream_gauntlets', slot: 'hands',     rarity: 'mythic', source: 'chest', unlockKey: 'equipment.dream_gauntlets.unlock', unlockedBy: '' },
  { key: 'astral_crown',       slot: 'head',      rarity: 'mythic', source: 'chest', unlockKey: 'equipment.astral_crown.unlock',       unlockedBy: '' },
  { key: 'transcendence_sash', slot: 'accessory', rarity: 'mythic', source: 'chest', unlockKey: 'equipment.transcendence_sash.unlock', unlockedBy: '' },
];

/** Equipamiento CRAFTEABLE en la fragua (cosmético, NUNCA da XP). */
export const CRAFTABLE_EQUIPMENT: EquipmentDef[] = [
  { key: 'iron_clasp',     slot: 'accessory', rarity: 'common',    source: 'craft', unlockKey: 'equipment.iron_clasp.unlock',     unlockedBy: '' },
  { key: 'stone_ring',     slot: 'accessory', rarity: 'rare',      source: 'craft', unlockKey: 'equipment.stone_ring.unlock',     unlockedBy: '' },
  { key: 'forest_wrap',    slot: 'back',      rarity: 'rare',      source: 'craft', unlockKey: 'equipment.forest_wrap.unlock',    unlockedBy: '' },
  { key: 'ember_talisman', slot: 'accessory', rarity: 'epic',      source: 'craft', unlockKey: 'equipment.ember_talisman.unlock', unlockedBy: '' },
  { key: 'granite_badge',  slot: 'chest',     rarity: 'epic',      source: 'craft', unlockKey: 'equipment.granite_badge.unlock',  unlockedBy: '' },
  { key: 'crystal_amulet', slot: 'accessory', rarity: 'legendary', source: 'craft', unlockKey: 'equipment.crystal_amulet.unlock', unlockedBy: '' },
];

/** Catálogo completo (logros + cofres + crafteable). */
export const EQUIPMENT: EquipmentDef[] = [...ACHIEVEMENT_EQUIPMENT, ...CHEST_LOOT, ...CRAFTABLE_EQUIPMENT];

export const EQUIPMENT_BY_KEY: Record<string, EquipmentDef> = Object.fromEntries(
  EQUIPMENT.map((e) => [e.key, e]),
);
