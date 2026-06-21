import { vi, beforeEach, afterEach } from 'vitest';
import { resetSupabaseMocks } from './mocks/supabase';
import { resetStripeMocks } from './mocks/stripe';

// Reset mocks before each test
beforeEach(() => {
  resetSupabaseMocks();
  resetStripeMocks();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test123');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

// Mock Web Crypto API for tests (required for attribution server-side tracking)
if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto;
}

if (!globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: {
      digest: vi.fn().mockImplementation(async (algorithm: string, data: BufferSource) => {
        // Simple deterministic hash mock for tests
        const text = new TextDecoder().decode(data as ArrayBuffer);
        const hash = text.split('').reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);

        // Return as ArrayBuffer (32 bytes for SHA-256)
        const buffer = new ArrayBuffer(32);
        const view = new Uint8Array(buffer);
        // Fill with deterministic values based on hash
        for (let i = 0; i < 32; i++) {
          view[i] = (hash + i) & 0xFF;
        }
        return buffer;
      }),
    },
    writable: true,
    configurable: true,
  });
}
