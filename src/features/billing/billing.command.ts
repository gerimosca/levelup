import { createClient } from '@supabase/supabase-js';
import type {
  Customer,
  UpsertCustomerInput,
  UpsertSubscriptionInput,
  SubscriptionStatus,
} from './types';

// Create admin client with service role for webhook operations
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper to safely format Date to ISO string
function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function upsertCustomer(
  input: UpsertCustomerInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  console.log('Upserting customer:', {
    user_id: input.user_id,
    stripe_customer_id: input.stripe_customer_id,
  });

  const { error } = await supabase.from('customers').upsert(
    {
      user_id: input.user_id,
      stripe_customer_id: input.stripe_customer_id,
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    console.error('Error upserting customer:', error);
    return { success: false, error: error.message };
  }

  console.log('Customer upserted successfully');
  return { success: true, error: null };
}

// Get customer by Stripe ID (uses admin client for webhook operations)
export async function getCustomerByStripeId(
  stripeCustomerId: string
): Promise<Customer | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Customer;
}

export async function upsertSubscription(
  input: UpsertSubscriptionInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  console.log('Upserting subscription:', {
    id: input.id,
    user_id: input.user_id,
    status: input.status,
    stripe_price_id: input.stripe_price_id,
  });

  const { error } = await supabase.from('subscriptions').upsert(
    {
      id: input.id,
      user_id: input.user_id,
      organization_id: input.organization_id,
      stripe_customer_id: input.stripe_customer_id,
      stripe_price_id: input.stripe_price_id,
      status: input.status,
      current_period_start: formatDate(input.current_period_start),
      current_period_end: formatDate(input.current_period_end),
      cancel_at_period_end: input.cancel_at_period_end,
      trial_start_at: formatDate(input.trial_start_at),
      trial_end_at: formatDate(input.trial_end_at),
      canceled_at: formatDate(input.canceled_at),
      cancellation_reason: input.cancellation_reason || null,
      ended_at: formatDate(input.ended_at),
      cancel_at: formatDate(input.cancel_at),
      cancellation_details: input.cancellation_details || null,
      metadata: input.metadata || {},
      attribution_data: input.attribution_data || {},
      price_amount: input.price_amount || null,
      price_currency: input.price_currency || null,
    },
    {
      onConflict: 'id',
    }
  );

  if (error) {
    console.error('Error upserting subscription:', error);
    return { success: false, error: error.message };
  }

  console.log('Subscription upserted successfully:', input.id);
  return { success: true, error: null };
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error updating subscription status:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
