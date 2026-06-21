'use server';

import { redirect } from 'next/navigation';
import { getUser } from '@/shared/auth';
import { handlePortalSession } from './billing.handler';
import type { BillingState } from './types';

export async function portalAction(): Promise<BillingState> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to access billing',
    };
  }

  const result = await handlePortalSession(user.id);

  if (result.success && result.url) {
    // Stripe Portal URLs are external, cast to satisfy typed routes
    redirect(result.url as any);
  }

  return result;
}
