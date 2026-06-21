import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  upsert: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  in: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  limit: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => mockSupabaseClient),
  maybeSingle: vi.fn(() => mockSupabaseClient),
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

// Helper to set mock response
export const setMockResponse = (data: unknown, error: unknown = null) => {
  const response = { data, error };
  // @ts-expect-error - Mock return types don't match chainable structure
  mockSupabaseClient.single.mockResolvedValue(response);
  // @ts-expect-error - Mock return types don't match chainable structure
  mockSupabaseClient.maybeSingle.mockResolvedValue(response);
  // For queries without .single()
  Object.assign(mockSupabaseClient, response);
  return response;
};

// Reset all mocks
export const resetSupabaseMocks = () => {
  Object.values(mockSupabaseClient).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as ReturnType<typeof vi.fn>).mockReset();
      (mock as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient);
    }
  });
};

// Mock createClient function
export const createClientMock = vi.fn(() => Promise.resolve(mockSupabaseClient));

// Mock for server-side client
vi.mock('@/shared/database/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

// Mock for admin client (service role)
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));
