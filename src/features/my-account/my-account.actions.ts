'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import { handleGetProfile, handleUpdateProfile } from './my-account.handler';

export async function getProfileAction() {
  const user = await getUser();

  if (!user) {
    return { profile: null, error: 'Not authenticated' };
  }

  return handleGetProfile(user.id);
}

export async function updateProfileAction(
  _prevState: { success: boolean; error: string | null } | null,
  formData: FormData
) {
  const user = await getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const input = {
    fullName: formData.get('fullName') as string,
    language: formData.get('language') as 'en' | 'es',
    timezone: formData.get('timezone') as string,
  };

  const result = await handleUpdateProfile(user.id, input);

  if (result.success) {
    revalidatePath('/my-account');
  }

  return result;
}
