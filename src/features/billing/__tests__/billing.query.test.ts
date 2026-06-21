import { describe, it, expect, vi } from 'vitest';
import { mockSupabaseClient, setMockResponse } from '@/shared/test-utils/mocks/supabase';
import {
  createMockSubscription,
  createMockCustomer,
} from '@/shared/test-utils/factories/billing';
import { getSubscription, getCustomer, hasActiveSubscription } from '../billing.query';

// Mock the createClient import
vi.mock('@/shared/database/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

describe('billing.query', () => {
  describe('getSubscription', () => {
    it('should return subscription for user with active subscription', async () => {
      // Using type-safe factory - TypeScript will error if Subscription type changes
      const mockSubscription = createMockSubscription({
        id: 'sub_123',
        user_id: 'user_123',
        status: 'active',
      });

      setMockResponse(mockSubscription);

      const result = await getSubscription('user_123');

      expect(result).toEqual(mockSubscription);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user_123');
      expect(mockSupabaseClient.in).toHaveBeenCalledWith('status', ['active', 'trialing', 'past_due']);
    });

    it('should return null when no subscription found', async () => {
      setMockResponse(null, { message: 'Not found' });

      const result = await getSubscription('user_without_sub');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      setMockResponse(null, { message: 'Database error' });

      const result = await getSubscription('user_123');

      expect(result).toBeNull();
    });
  });

  describe('getCustomer', () => {
    it('should return customer for valid user', async () => {
      // Using type-safe factory
      const mockCustomer = createMockCustomer({
        id: 'cust_db_123',
        user_id: 'user_123',
        stripe_customer_id: 'cus_stripe_123',
      });

      setMockResponse(mockCustomer);

      const result = await getCustomer('user_123');

      expect(result).toEqual(mockCustomer);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('customers');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user_123');
    });

    it('should return null when customer not found', async () => {
      setMockResponse(null, { message: 'Not found' });

      const result = await getCustomer('user_without_customer');

      expect(result).toBeNull();
    });
  });

  describe('hasActiveSubscription', () => {
    it('should return true when user has active subscription', async () => {
      setMockResponse({ id: 'sub_123' });

      const result = await hasActiveSubscription('user_123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.in).toHaveBeenCalledWith('status', ['active', 'trialing']);
    });

    it('should return false when user has no active subscription', async () => {
      setMockResponse(null);

      const result = await hasActiveSubscription('user_123');

      expect(result).toBe(false);
    });
  });
});
