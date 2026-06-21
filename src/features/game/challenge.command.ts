import { createClientServer } from '@/shared/database/supabase';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  return Array.from({ length: 6 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('');
}

export async function createChallenge(
  userId: string,
  name: string,
): Promise<{ id: string; inviteCode: string } | null> {
  const supabase = await createClientServer();

  // Intenta hasta 5 veces en caso de colisión de código (muy improbable)
  for (let i = 0; i < 5; i++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from('challenges')
      .insert({ name, invite_code: code, created_by: userId })
      .select('id, invite_code')
      .single();

    if (!error && data) {
      // Añadir al creador como primer miembro
      await supabase
        .from('challenge_members')
        .insert({ challenge_id: data.id, user_id: userId });
      return { id: data.id as string, inviteCode: data.invite_code as string };
    }
    if (error && !error.message.includes('unique')) throw error;
  }
  return null;
}

export async function joinChallenge(
  userId: string,
  challengeId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('challenge_members')
    .insert({ challenge_id: challengeId, user_id: userId });
  return { success: !error };
}

export async function leaveChallenge(
  userId: string,
  challengeId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('challenge_members')
    .delete()
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);
  return { success: !error };
}
