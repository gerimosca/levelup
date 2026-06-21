/**
 * Type-safe factories for billing test data
 *
 * These factories use the actual types from the billing feature,
 * so TypeScript will fail if the types change and the factories
 * are not updated.
 */

import type {
  Subscription,
  Customer,
  SubscriptionStatus,
} from '@/features/billing/types';

/**
 * Create a mock Subscription with all required fields
 * TypeScript will error if Subscription type changes
 */
export const createMockSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription => ({
  id: 'sub_test123',
  user_id: 'user_test123',
  organization_id: null,
  stripe_customer_id: 'cus_test123',
  stripe_price_id: 'price_test123',
  status: 'active' as SubscriptionStatus,
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  trial_start_at: null,
  trial_end_at: null,
  canceled_at: null,
  cancellation_reason: null,
  ended_at: null,
  cancel_at: null,
  cancellation_details: null,
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  attribution_data: {},
  ...overrides,
});

/**
 * Create a mock Customer with all required fields
 * TypeScript will error if Customer type changes
 */
export const createMockCustomer = (
  overrides: Partial<Customer> = {}
): Customer => ({
  id: 'cust_db_test123',
  user_id: 'user_test123',
  organization_id: null,
  stripe_customer_id: 'cus_test123',
  created_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Create subscription with specific status
 */
export const createActiveSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription =>
  createMockSubscription({
    status: 'active',
    ...overrides,
  });

export const createTrialingSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription =>
  createMockSubscription({
    status: 'trialing',
    trial_start_at: new Date().toISOString(),
    trial_end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  });

export const createCanceledSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription =>
  createMockSubscription({
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    cancellation_reason: 'customer_request',
    cancellation_details: {
      reason: 'cancellation_requested',
      comment: null,
      feedback: 'too_expensive',
    },
    ...overrides,
  });

export const createPastDueSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription =>
  createMockSubscription({
    status: 'past_due',
    ...overrides,
  });
