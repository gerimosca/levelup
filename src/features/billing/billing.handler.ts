import { stripe } from '@/shared/payments/stripe/server';
import { getCustomer } from './billing.query';
import type { BillingState } from './types';

export async function handlePortalSession(
  userId: string,
  returnUrl?: string
): Promise<BillingState> {
  try {
    // Get customer from database
    const customer = await getCustomer(userId);

    if (!customer) {
      return {
        success: false,
        error: 'No subscription found. Please subscribe to a plan first.',
      };
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url:
        returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return {
      success: true,
      error: null,
      url: portalSession.url,
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return {
      success: false,
      error: 'Failed to create billing portal session',
    };
  }
}
