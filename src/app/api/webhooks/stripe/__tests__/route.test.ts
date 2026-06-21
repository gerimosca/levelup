import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockStripe,
  createMockStripeEvent,
  createMockSubscription,
  createMockCheckoutSession,
} from '@/shared/test-utils/mocks/stripe';
import { mockSupabaseClient, setMockResponse } from '@/shared/test-utils/mocks/supabase';
import { POST } from '../route';

// Mock dependencies
vi.mock('@/shared/payments', () => ({
  stripe: mockStripe,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock('@/features/attribution', () => ({
  trackServerPurchase: vi.fn().mockResolvedValue(undefined),
}));

// Helper to create a mock request
const createMockRequest = (body: string, signature = 'valid_signature') => {
  return {
    text: () => Promise.resolve(body),
  } as Request;
};

// Mock headers
vi.mock('next/headers', () => ({
  headers: () => Promise.resolve({
    get: (name: string) => name === 'stripe-signature' ? 'valid_signature' : null,
  }),
}));

describe('Stripe Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/webhooks/stripe', () => {
    it('should return 400 if signature verification fails', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = createMockRequest('{}');
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Webhook Error');
    });

    describe('checkout.session.completed', () => {
      it('should create customer and subscription on checkout completion', async () => {
        const mockSession = createMockCheckoutSession({
          client_reference_id: 'user_123',
          customer: 'cus_123',
          subscription: 'sub_123',
        });

        const mockSubscription = createMockSubscription({
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
        });

        const event = createMockStripeEvent('checkout.session.completed', mockSession);

        mockStripe.webhooks.constructEvent.mockReturnValue(event);
        mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

        // Mock upsert responses
        // @ts-expect-error - Mock return type
        mockSupabaseClient.upsert.mockResolvedValue({ error: null });

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.received).toBe(true);

        // Verify customer was upserted
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('customers');
        expect(mockSupabaseClient.upsert).toHaveBeenCalled();

        // Verify subscription was upserted
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
      });

      it('should skip if no client_reference_id', async () => {
        const mockSession = createMockCheckoutSession({
          client_reference_id: null,
        });

        const event = createMockStripeEvent('checkout.session.completed', mockSession);
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);

        expect(response.status).toBe(200);
        // Customer upsert should not be called without client_reference_id
      });
    });

    describe('customer.subscription.updated', () => {
      it('should update subscription status', async () => {
        const mockSubscription = createMockSubscription({
          id: 'sub_123',
          customer: 'cus_123',
          status: 'past_due',
        });

        const event = createMockStripeEvent('customer.subscription.updated', mockSubscription);
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        // Mock customer lookup
        setMockResponse({
          id: 'db_cust_123',
          user_id: 'user_123',
          stripe_customer_id: 'cus_123',
        });

        // @ts-expect-error - Mock return type
        mockSupabaseClient.upsert.mockResolvedValue({ error: null });

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
      });

      it('should handle missing customer gracefully', async () => {
        const mockSubscription = createMockSubscription({
          customer: 'cus_unknown',
        });

        const event = createMockStripeEvent('customer.subscription.updated', mockSubscription);
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        // Customer not found
        setMockResponse(null, { message: 'Not found' });

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);

        // Should still return 200 but log error
        expect(response.status).toBe(200);
      });
    });

    describe('customer.subscription.deleted', () => {
      it('should mark subscription as canceled', async () => {
        const mockSubscription = createMockSubscription({
          id: 'sub_123',
          customer: 'cus_123',
          status: 'canceled',
          canceled_at: Math.floor(Date.now() / 1000),
          cancellation_details: {
            reason: 'cancellation_requested',
            comment: 'Too expensive',
            feedback: 'too_expensive',
          },
        });

        const event = createMockStripeEvent('customer.subscription.deleted', mockSubscription);
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        // Mock customer lookup
        setMockResponse({
          id: 'db_cust_123',
          user_id: 'user_123',
          stripe_customer_id: 'cus_123',
        });

        // @ts-expect-error - Mock return type
        mockSupabaseClient.upsert.mockResolvedValue({ error: null });

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);

        expect(response.status).toBe(200);
      });
    });

    describe('invoice.payment_failed', () => {
      it('should mark subscription as past_due', async () => {
        const mockInvoice = {
          id: 'in_123',
          subscription: 'sub_123',
        };

        const event = createMockStripeEvent('invoice.payment_failed', mockInvoice);
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        // Mock the update chain to return success
        // @ts-expect-error - Mock return type
        mockSupabaseClient.eq.mockResolvedValue({ error: null });

        const request = createMockRequest(JSON.stringify(event));
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
        expect(mockSupabaseClient.update).toHaveBeenCalledWith({ status: 'past_due' });
      });
    });
  });
});
