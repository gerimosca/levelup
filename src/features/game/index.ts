/**
 * features/game — el core loop de LevelUp (VSA + CQRS).
 * Orquesta el motor puro (@/game-core) + persistencia (Supabase).
 */
export {
  getTodayStateAction,
  claimHabitAction,
  saveActiveHabitsAction,
  logRelapseAction,
  getProfileAction,
  getStatsAction,
  getJournalAction,
  saveJournalAction,
  exportDataAction,
  deleteDataAction,
  getEconomyAction,
  saveEconomyAction,
  equipItemAction,
  openChestAction,
  markVictorySeenAction,
  claimExpeditionAction,
  buildStructureAction,
  getEncyclopediaAction,
} from './game.actions';
export { HomeClient } from './components/home-client';
export { PetClient } from './components/pet-client';
export { MeClient } from './components/me-client';
export { MapClient } from './components/map-client';
export { StatsClient } from './components/stats-client';
export { SettingsClient } from './components/settings-client';
export { EncyclopediaClient } from './components/encyclopedia-client';
export { MotionProvider } from './components/motion-provider';
export { JournalModal } from './components/journal-modal';
export { PwaInstallBanner } from './components/pwa-install';
export { PwaRegister } from './components/pwa-register';
export { OfflineBanner } from './components/offline-banner';
export { CraftForge } from './components/craft-forge';
export type {
  TodayState,
  ClaimResult,
  ClaimHabitInput,
  MissionView,
  DailyEventView,
  ProfileView,
  RelapseResult,
  ChallengeMemberView,
  ChallengeView,
} from './types';

export { ChallengeClient } from './components/challenge-client';
