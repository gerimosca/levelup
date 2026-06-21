import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  captureAttribution,
  captureBasicAttribution,
} from '@/features/attribution/capture';

// Mock window.location
const mockLocation = {
  search: '',
  pathname: '/landing',
};

// Mock document
const mockDocument = {
  referrer: 'https://google.com',
  cookie: '',
};

// Mock navigator
const mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Attribution Capture', () => {
  beforeEach(() => {
    mockLocation.search = '';
    mockLocation.pathname = '/landing';
    mockDocument.referrer = 'https://google.com';
    mockDocument.cookie = '';
  });

  describe('captureBasicAttribution', () => {
    it('captures UTM parameters', () => {
      mockLocation.search =
        '?utm_source=google&utm_medium=cpc&utm_campaign=brand';

      const data = captureBasicAttribution();

      expect(data.utm_source).toBe('google');
      expect(data.utm_medium).toBe('cpc');
      expect(data.utm_campaign).toBe('brand');
    });

    it('captures landing page and referrer', () => {
      mockLocation.pathname = '/pricing';
      mockDocument.referrer = 'https://facebook.com';

      const data = captureBasicAttribution();

      expect(data.landing_page).toBe('/pricing');
      expect(data.referrer).toBe('https://facebook.com');
    });

    it('captures via parameter', () => {
      mockLocation.search = '?via=partner123';

      const data = captureBasicAttribution();

      expect(data.via).toBe('partner123');
    });

    it('does NOT capture gclid or fbclid', () => {
      mockLocation.search = '?gclid=abc123&fbclid=def456&utm_source=google';

      const data = captureBasicAttribution();

      expect(data.gclid).toBeUndefined();
      expect(data.fbclid).toBeUndefined();
      expect(data.utm_source).toBe('google'); // UTM should be captured
    });

    it('captures device type', () => {
      const data = captureBasicAttribution();

      expect(data.device_type).toBe('desktop');
    });

    it('captures timestamp', () => {
      const data = captureBasicAttribution();

      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp!).getTime()).not.toBeNaN();
    });
  });

  describe('captureAttribution', () => {
    describe('with includeClickIds=true (default)', () => {
      it('captures gclid', () => {
        mockLocation.search = '?gclid=abc123';

        const data = captureAttribution({ includeClickIds: true });

        expect(data.gclid).toBe('abc123');
      });

      it('captures fbclid and generates fbc', () => {
        mockLocation.search = '?fbclid=def456';

        const data = captureAttribution({ includeClickIds: true });

        expect(data.fbclid).toBe('def456');
        expect(data.fbc).toMatch(/^fb\.1\.\d+\.def456$/);
      });

      it('captures ttclid', () => {
        mockLocation.search = '?ttclid=ghi789';

        const data = captureAttribution({ includeClickIds: true });

        expect(data.ttclid).toBe('ghi789');
      });

      it('captures fbp from cookie', () => {
        mockDocument.cookie = '_fbp=fb.1.1234567890.987654321';

        const data = captureAttribution({ includeClickIds: true });

        expect(data.fbp).toBe('fb.1.1234567890.987654321');
      });

      it('captures both UTMs and click IDs', () => {
        mockLocation.search =
          '?utm_source=google&utm_campaign=brand&gclid=abc123';

        const data = captureAttribution({ includeClickIds: true });

        expect(data.utm_source).toBe('google');
        expect(data.utm_campaign).toBe('brand');
        expect(data.gclid).toBe('abc123');
      });
    });

    describe('with includeClickIds=false', () => {
      it('does NOT capture gclid', () => {
        mockLocation.search = '?gclid=abc123';

        const data = captureAttribution({ includeClickIds: false });

        expect(data.gclid).toBeUndefined();
      });

      it('does NOT capture fbclid', () => {
        mockLocation.search = '?fbclid=def456';

        const data = captureAttribution({ includeClickIds: false });

        expect(data.fbclid).toBeUndefined();
        expect(data.fbc).toBeUndefined();
      });

      it('does NOT capture fbp', () => {
        mockDocument.cookie = '_fbp=fb.1.1234567890.987654321';

        const data = captureAttribution({ includeClickIds: false });

        expect(data.fbp).toBeUndefined();
      });

      it('still captures UTMs', () => {
        mockLocation.search =
          '?utm_source=google&utm_campaign=brand&gclid=abc123';

        const data = captureAttribution({ includeClickIds: false });

        expect(data.utm_source).toBe('google');
        expect(data.utm_campaign).toBe('brand');
        expect(data.gclid).toBeUndefined();
      });

      it('still captures via, referrer, landing page', () => {
        mockLocation.search = '?via=partner&gclid=abc';
        mockLocation.pathname = '/signup';

        const data = captureAttribution({ includeClickIds: false });

        expect(data.via).toBe('partner');
        expect(data.landing_page).toBe('/signup');
        expect(data.referrer).toBe('https://google.com');
      });
    });

    it('defaults to includeClickIds=true', () => {
      mockLocation.search = '?gclid=abc123';

      const data = captureAttribution();

      expect(data.gclid).toBe('abc123');
    });
  });

  describe('edge cases', () => {
    it('handles empty URL parameters', () => {
      mockLocation.search = '';

      const data = captureAttribution();

      expect(data.utm_source).toBeUndefined();
      expect(data.gclid).toBeUndefined();
    });

    it('handles malformed cookies', () => {
      mockDocument.cookie = 'invalid-cookie-format';

      const data = captureAttribution({ includeClickIds: true });

      expect(data.fbp).toBeUndefined();
    });

    it('cleans undefined values', () => {
      mockLocation.search = '?utm_source=google';

      const data = captureAttribution();

      // Should not have undefined keys in the object
      const keys = Object.keys(data);
      keys.forEach((key) => {
        expect(data[key as keyof typeof data]).not.toBeUndefined();
      });
    });
  });
});
