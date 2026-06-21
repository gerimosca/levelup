'use server';

import { getUser } from '@/shared/auth';
import {
  handleClaimHabit,
  handleGetTodayState,
  handleSaveActiveHabits,
  handleLogRelapse,
  handleGetProfile,
  handleGetStats,
  handleExportData,
  handleDeleteData,
  handleGetEconomy,
  handleSaveEconomy,
  handleEquipItem,
  handleOpenChest,
  handleMarkVictorySeen,
  handleClaimExpedition,
  handleBuildStructure,
  handleGetEncyclopedia,
  handleUpdateAvatarConfig,
  handleSetActiveTitle,
  handleAdvanceSeason,
  handleCraftItem,
} from './game.handler';
import type {
  AvatarConfig,
  BuildResult,
  ChestRewardResult,
  ClaimExpeditionResult,
  ClaimHabitInput,
  ClaimResult,
  EconomySettings,
  ProfileView,
  RelapseResult,
  SaveActiveHabitsInput,
  SaveEconomyInput,
  StatsView,
  TodayState,
} from './types';

export async function getTodayStateAction(
  dayDate: string,
): Promise<{ state: TodayState | null; error?: string }> {
  const user = await getUser();
  if (!user) return { state: null, error: 'Not authenticated' };
  const state = await handleGetTodayState(user.id, dayDate);
  return { state };
}

export async function claimHabitAction(input: ClaimHabitInput): Promise<ClaimResult> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      xpAwarded: 0,
      bonusXp: 0,
      missionComplete: false,
      levelBefore: 1,
      levelAfter: 1,
      leveledUp: false,
      tierChanged: false,
      streakMultiplier: 1,
      attrBonusXp: 0,
      enemyDamageDealt: 0,
      newTitles: [],
      enemy: { hpCurrent: 0, hpMax: 0 },
      newAchievements: [],
      player: { level: 1, xpTotal: 0, streak: 0 },
    };
  }
  return handleClaimHabit(user.id, input);
}

export async function saveActiveHabitsAction(
  input: SaveActiveHabitsInput,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  return handleSaveActiveHabits(user.id, input);
}

export async function logRelapseAction(dayDate: string): Promise<RelapseResult> {
  const user = await getUser();
  if (!user) return { success: false, enemy: { hpCurrent: 0, hpMax: 0 } };
  return handleLogRelapse(user.id, dayDate);
}

export async function getProfileAction(): Promise<{
  profile: ProfileView | null;
  error?: string;
}> {
  const user = await getUser();
  if (!user) return { profile: null, error: 'Not authenticated' };
  return { profile: await handleGetProfile(user.id) };
}

export async function getStatsAction(
  dayDate: string,
): Promise<{ stats: StatsView | null }> {
  const user = await getUser();
  if (!user) return { stats: null };
  return { stats: await handleGetStats(user.id, dayDate) };
}

export async function exportDataAction(): Promise<{ data: Record<string, unknown[]> | null }> {
  const user = await getUser();
  if (!user) return { data: null };
  return { data: await handleExportData(user.id) };
}

export async function deleteDataAction(): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleDeleteData(user.id);
}

export async function getEconomyAction(): Promise<{ economy: EconomySettings | null }> {
  const user = await getUser();
  if (!user) return { economy: null };
  return { economy: await handleGetEconomy(user.id) };
}

export async function saveEconomyAction(
  input: SaveEconomyInput,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  return handleSaveEconomy(user.id, input);
}

export async function equipItemAction(
  itemKey: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  return handleEquipItem(user.id, itemKey);
}

export async function openChestAction(day: number): Promise<ChestRewardResult> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleOpenChest(user.id, day);
}

export async function markVictorySeenAction(
  seasonKey: string,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleMarkVictorySeen(user.id, seasonKey);
}

export async function claimExpeditionAction(
  dayDate: string,
): Promise<ClaimExpeditionResult> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleClaimExpedition(user.id, dayDate);
}

export async function buildStructureAction(structureKey: string): Promise<BuildResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  return handleBuildStructure(user.id, structureKey);
}

export async function getEncyclopediaAction(): Promise<{ found: string[]; built: string[] }> {
  const user = await getUser();
  if (!user) return { found: [], built: [] };
  return handleGetEncyclopedia(user.id);
}

export async function updateAvatarConfigAction(
  config: AvatarConfig,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleUpdateAvatarConfig(user.id, config);
}

export async function setActiveTitleAction(
  titleKey: string | null,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  return handleSetActiveTitle(user.id, titleKey);
}

export async function advanceSeasonAction(): Promise<{
  success: boolean;
  nextSeasonKey: string | null;
}> {
  const user = await getUser();
  if (!user) return { success: false, nextSeasonKey: null };
  return handleAdvanceSeason(user.id);
}

export async function craftItemAction(
  itemKey: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'not_authenticated' };
  return handleCraftItem(user.id, itemKey);
}

export async function getOwnedCraftKeysAction(): Promise<string[]> {
  const user = await getUser();
  if (!user) return [];
  const { getEquipmentRows } = await import('./game.query');
  const rows = await getEquipmentRows(user.id);
  return rows.map((r) => r.item_key as string);
}
