import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackServerConversion,
  trackServerSignup,
  trackServerPurchase,
} from '@/features/attribution/server';
import type { AttributionData } from '@/features/attribution/types';

// Mock fetch
global.fetch = vi.fn();

// Mock config
vi.mock('@/features/attribution/config', () => ({
  attributionConfig: {
    debug: false,
    platforms: {
      google: {
        adsId: 'AW-123456789',
        conversionLabel: 'ABCDEF',
        apiToken: 'google-api-token',
      },
      meta: {
        pixelId: '1234567890',
        accessToken: 'meta-access-token',
      },
    },
  },
  hasServerTracking: (platform: string) => {
    if (platform === 'google') return true;
    if (platform === 'meta') return true;
    return false;
  },
}));

describe('Server-side Attribution Tracking', () => {
  const mockAttribution: AttributionData = {
    utm_source: 'google',
    utm_medium: 'cpc',
    gclid: 'gclid123',
    fbclid: 'fbclid456',
    fbc: 'fb.1.1234567890.fbclid456',
    fbp: 'fb.1.1234567890.987654321',
    landing_page: '/signup',
    referrer: 'https://google.com',
    user_agent: 'Mozilla/5.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => '',
    });
  });

  describe('trackServerConversion', () => {
    describe('with hasMarketingConsent=true', () => {
      it('sends to both Google and Meta', async () => {
        const result = await trackServerConversion(
          'signup',
          'event-123',
          mockAttribution,
          { email: 'test@example.com' },
          { hasMarketingConsent: true }
        );

        // Meta API should be called
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('graph.facebook.com'),
          expect.any(Object)
        );

        // Check result
        expect(result.meta).toBe(true);
        expect(result.google).toBe(true);
      });

      it('includes fbc and fbp in Meta payload', async () => {
        await trackServerConversion(
          'signup',
          'event-123',
          mockAttribution,
          { email: 'test@example.com' },
          { hasMarketingConsent: true }
        );

        const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock
          .calls[0];
        const body = JSON.parse(fetchCall[1].body);
        const eventData = body.data[0];

        expect(eventData.user_data.fbc).toBe(mockAttribution.fbc);
        expect(eventData.user_data.fbp).toBe(mockAttribution.fbp);
      });
    });

    describe('with hasMarketingConsent=false', () => {
      it('does NOT send to Meta', async () => {
        const result = await trackServerConversion(
          'signup',
          'event-123',
          mockAttribution,
          { email: 'test@example.com' },
          { hasMarketingConsent: false }
        );

        // Meta API should NOT be called
        expect(global.fetch).not.toHaveBeenCalledWith(
          expect.stringContaining('graph.facebook.com'),
          expect.any(Object)
        );

        expect(result.meta).toBe(false);
        expect(result.google).toBe(true);
      });

      it('still processes Google (Consent Mode handles it)', async () => {
        const result = await trackServerConversion(
          'signup',
          'event-123',
          mockAttribution,
          { email: 'test@example.com' },
          { hasMarketingConsent: false }
        );

        // Google should still be processed
        expect(result.google).toBe(true);
      });
    });

    describe('with hasMarketingConsent=undefined (default)', () => {
      it('defaults to NOT sending to Meta', async () => {
        const result = await trackServerConversion(
          'signup',
          'event-123',
          mockAttribution,
          { email: 'test@example.com' }
        );

        expect(result.meta).toBe(false);
      });
    });
  });

  describe('trackServerSignup', () => {
    it('passes hasMarketingConsent correctly', async () => {
      const result = await trackServerSignup(
        'event-123',
        mockAttribution,
        'test@example.com',
        'user-123',
        true // hasMarketingConsent
      );

      expect(result.meta).toBe(true);
    });

    it('defaults to no Meta without consent', async () => {
      const result = await trackServerSignup(
        'event-123',
        mockAttribution,
        'test@example.com',
        'user-123'
        // hasMarketingConsent undefined
      );

      expect(result.meta).toBe(false);
    });
  });

  describe('trackServerPurchase', () => {
    it('passes hasMarketingConsent correctly', async () => {
      const result = await trackServerPurchase(
        'event-123',
        mockAttribution,
        99.99,
        'USD',
        'test@example.com',
        'user-123',
        true // hasMarketingConsent
      );

      expect(result.meta).toBe(true);
    });

    it('includes value and currency in payload', async () => {
      await trackServerPurchase(
        'event-123',
        mockAttribution,
        99.99,
        'EUR',
        'test@example.com',
        'user-123',
        true
      );

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const body = JSON.parse(fetchCall[1].body);
      const eventData = body.data[0];

      expect(eventData.custom_data.value).toBe(99.99);
      expect(eventData.custom_data.currency).toBe('EUR');
    });

    it('defaults to no Meta without consent', async () => {
      const result = await trackServerPurchase(
        'event-123',
        mockAttribution,
        99.99,
        'USD',
        'test@example.com',
        'user-123'
        // hasMarketingConsent undefined
      );

      expect(result.meta).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles Meta API errors gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const result = await trackServerConversion(
        'signup',
        'event-123',
        mockAttribution,
        { email: 'test@example.com' },
        { hasMarketingConsent: true }
      );

      expect(result.meta).toBe(false);
      expect(result.google).toBe(true);
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await trackServerConversion(
        'signup',
        'event-123',
        mockAttribution,
        { email: 'test@example.com' },
        { hasMarketingConsent: true }
      );

      expect(result.meta).toBe(false);
    });
  });

  describe('data privacy', () => {
    it('hashes email before sending to Meta', async () => {
      await trackServerConversion(
        'signup',
        'event-123',
        mockAttribution,
        { email: 'Test@Example.com' },
        { hasMarketingConsent: true }
      );

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const body = JSON.parse(fetchCall[1].body);
      const eventData = body.data[0];

      // Email should be hashed, not plain text
      expect(eventData.user_data.em).not.toBe('test@example.com');
      expect(eventData.user_data.em).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    });
  });
});
