import { vi } from 'vitest';
import type Stripe from 'stripe';

// Mock Stripe client
export const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
};

// Factory for creating mock Stripe objects
export const createMockSubscription = (
  overrides: Partial<Stripe.Subscription> = {}
): Stripe.Subscription => ({
  id: 'sub_test123',
  object: 'subscription',
  customer: 'cus_test123',
  status: 'active',
  items: {
    object: 'list',
    data: [
      {
        id: 'si_test123',
        object: 'subscription_item',
        price: {
          id: 'price_test123',
          object: 'price',
          currency: 'usd',
          unit_amount: 1000,
          unit_amount_decimal: '1000',
          product: 'prod_test123',
          type: 'recurring',
          active: true,
          created: 1234567890,
          livemode: false,
          metadata: {},
          nickname: null,
          recurring: {
            interval: 'month',
            interval_count: 1,
            usage_type: 'licensed',
            trial_period_days: null,
            meter: null,
            aggregate_usage: null,
          },
          tax_behavior: 'unspecified',
          billing_scheme: 'per_unit',
          custom_unit_amount: null,
          lookup_key: null,
          tiers_mode: null,
          transform_quantity: null,
        },
        plan: {
          id: 'price_test123',
          object: 'plan',
          active: true,
          amount: 1000,
          amount_decimal: '1000',
          billing_scheme: 'per_unit',
          created: 1234567890,
          currency: 'usd',
          interval: 'month',
          interval_count: 1,
          livemode: false,
          metadata: {},
          nickname: null,
          product: 'prod_test123',
          tiers_mode: null,
          transform_usage: null,
          trial_period_days: null,
          usage_type: 'licensed',
          meter: null,
          aggregate_usage: null,
        } as Stripe.Plan,
        quantity: 1,
        created: 1234567890,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        metadata: {},
        subscription: 'sub_test123',
        billing_thresholds: null,
        discounts: [],
        tax_rates: [],
      } as Stripe.SubscriptionItem,
    ],
    has_more: false,
    url: '/v1/subscription_items',
  },
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  cancel_at_period_end: false,
  canceled_at: null,
  ended_at: null,
  trial_start: null,
  trial_end: null,
  cancel_at: null,
  cancellation_details: null,
  metadata: {},
  created: 1234567890,
  livemode: false,
  start_date: 1234567890,
  application: null,
  application_fee_percent: null,
  automatic_tax: { enabled: false, liability: null },
  billing_cycle_anchor: 1234567890,
  billing_cycle_anchor_config: null,
  collection_method: 'charge_automatically',
  currency: 'usd',
  days_until_due: null,
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: [],
  invoice_settings: { account_tax_ids: null, issuer: { type: 'self' } },
  latest_invoice: null,
  next_pending_invoice_item_invoice: null,
  on_behalf_of: null,
  pause_collection: null,
  payment_settings: null,
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  test_clock: null,
  transfer_data: null,
  trial_settings: null,
  ...overrides,
} as Stripe.Subscription);

export const createMockCheckoutSession = (
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session => ({
  id: 'cs_test123',
  object: 'checkout.session',
  client_reference_id: 'user_test123',
  customer: 'cus_test123',
  subscription: 'sub_test123',
  amount_total: 1000,
  currency: 'usd',
  customer_email: 'test@example.com',
  metadata: {},
  mode: 'subscription',
  payment_status: 'paid',
  status: 'complete',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
  created: 1234567890,
  expires_at: 1234567890 + 3600,
  livemode: false,
  locale: null,
  url: null,
  ...overrides,
} as Stripe.Checkout.Session);

export const createMockStripeEvent = (
  type: string,
  data: unknown
): Stripe.Event => ({
  id: 'evt_test123',
  object: 'event',
  type,
  data: {
    object: data,
  },
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  livemode: false,
  pending_webhooks: 0,
  request: null,
} as Stripe.Event);

// Reset all mocks
export const resetStripeMocks = () => {
  mockStripe.webhooks.constructEvent.mockReset();
  mockStripe.subscriptions.retrieve.mockReset();
  mockStripe.subscriptions.update.mockReset();
  mockStripe.subscriptions.cancel.mockReset();
  mockStripe.customers.create.mockReset();
  mockStripe.customers.retrieve.mockReset();
  mockStripe.billingPortal.sessions.create.mockReset();
  mockStripe.checkout.sessions.create.mockReset();
};

// Mock the stripe module
vi.mock('@/shared/payments', () => ({
  stripe: mockStripe,
}));
