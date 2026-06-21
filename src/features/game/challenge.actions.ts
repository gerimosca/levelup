'use server';

import { getUser } from '@/shared/auth';
import { getUserChallenge, getChallengeByCode, isAlreadyMember } from './challenge.query';
import { createChallenge, joinChallenge, leaveChallenge } from './challenge.command';
import type { ChallengeView } from './types';

export async function getChallengeAction(
  todayDate: string,
): Promise<{ challenge: ChallengeView | null }> {
  const user = await getUser();
  if (!user) return { challenge: null };
  const challenge = await getUserChallenge(user.id, todayDate);
  return { challenge };
}

export async function createChallengeAction(
  name: string,
): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'not_authenticated' };
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return { success: false, error: 'name_required' };
  const result = await createChallenge(user.id, trimmed);
  if (!result) return { success: false, error: 'create_failed' };
  return { success: true, inviteCode: result.inviteCode };
}

export async function joinChallengeAction(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'not_authenticated' };
  const found = await getChallengeByCode(code);
  if (!found) return { success: false, error: 'invalid_code' };
  const already = await isAlreadyMember(user.id, found.id);
  if (already) return { success: false, error: 'already_member' };
  return joinChallenge(user.id, found.id);
}

export async function leaveChallengeAction(
  challengeId: string,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  return leaveChallenge(user.id, challengeId);
}
