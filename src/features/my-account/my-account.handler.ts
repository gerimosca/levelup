import { getProfile } from './my-account.query';
import { updateProfile } from './my-account.command';
import { profileSchema, type ProfileInput, type Profile } from './types';

/**
 * Handle getting user profile
 */
export async function handleGetProfile(userId: string): Promise<{
  profile: Profile | null;
  error: string | null;
}> {
  return getProfile(userId);
}

/**
 * Handle updating user profile
 */
export async function handleUpdateProfile(
  userId: string,
  input: ProfileInput
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const validationResult = profileSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message,
    };
  }

  return updateProfile(userId, validationResult.data);
}
