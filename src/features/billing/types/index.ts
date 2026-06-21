import { z } from 'zod';
import type { AttributionData } from '@/features/attribution';

// Subscription status enum matching Stripe
export const subscriptionStatusSchema = z.enum([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused',
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

// Database types
export type Customer = {
  id: string;
  user_id: string;
  organization_id: string | null;
  stripe_customer_id: string;
  created_at: string;
};

// Cancellation details from Stripe
export type CancellationDetails = {
  reason?: string | null;
  comment?: string | null;
  feedback?: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  organization_id: string | null;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start_at: string | null;
  trial_end_at: string | null;
  canceled_at: string | null;
  cancellation_reason: string | null;
  ended_at: string | null;
  cancel_at: string | null;
  cancellation_details: CancellationDetails | null;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
  attribution_data: AttributionData;
};

// Input types for commands
export type UpsertCustomerInput = {
  user_id: string;
  organization_id?: string;
  stripe_customer_id: string;
};

export type UpsertSubscriptionInput = {
  id: string;
  user_id: string;
  organization_id?: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: SubscriptionStatus;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  trial_start_at?: Date | null;
  trial_end_at?: Date | null;
  canceled_at?: Date | null;
  cancellation_reason?: string | null;
  ended_at?: Date | null;
  cancel_at?: Date | null;
  cancellation_details?: CancellationDetails | null;
  metadata?: Record<string, string>;
  attribution_data?: AttributionData;
  price_amount?: number | null;
  price_currency?: string | null;
};

// State types for handlers
export type BillingState = {
  success: boolean;
  error: string | null;
  url?: string;
};

// Portal session input
export const portalSessionSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export type PortalSessionInput = z.infer<typeof portalSessionSchema>;
