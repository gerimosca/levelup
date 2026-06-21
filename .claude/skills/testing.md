# Testing Skill

Guide for writing tests in the SaaS Boilerplate following VSA + CQRS patterns.

## When to Use

- Creating tests for a new feature
- Adding tests to existing code
- Setting up test infrastructure for new patterns

## Test File Structure

For each feature, create tests following VSA:

```
src/features/[feature]/
└── __tests__/
    ├── [feature].query.test.ts    # Query tests
    ├── [feature].command.test.ts  # Command tests
    └── [feature].handler.test.ts  # Handler tests
```

## Step-by-Step: Unit Test for Query

### 1. Create test file

```typescript
// src/features/[feature]/__tests__/[feature].query.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mockSupabaseClient, setMockResponse } from '@/test/mocks/supabase';

// Mock must come before importing the module under test
vi.mock('@/shared/database/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

// Now import the function to test
import { getEntity } from '../[feature].query';
```

### 2. Write test cases

```typescript
describe('[feature].query', () => {
  describe('getEntity', () => {
    it('should return entity when found', async () => {
      // Arrange
      const mockData = {
        id: 'entity_123',
        name: 'Test Entity',
        created_at: '2024-01-01T00:00:00Z',
      };
      setMockResponse(mockData);

      // Act
      const result = await getEntity('entity_123');

      // Assert
      expect(result).toEqual(mockData);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('entities');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'entity_123');
    });

    it('should return null when not found', async () => {
      setMockResponse(null, { message: 'Not found' });

      const result = await getEntity('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      setMockResponse(null, { message: 'Database error', code: '500' });

      const result = await getEntity('entity_123');

      expect(result).toBeNull();
    });
  });
});
```

## Step-by-Step: Unit Test for Command

### 1. Create test file

```typescript
// src/features/[feature]/__tests__/[feature].command.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mockSupabaseClient } from '@/test/mocks/supabase';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

import { createEntity, updateEntity } from '../[feature].command';
```

### 2. Write test cases

```typescript
describe('[feature].command', () => {
  describe('createEntity', () => {
    it('should create entity successfully', async () => {
      mockSupabaseClient.insert.mockResolvedValue({ error: null });

      const result = await createEntity({
        name: 'New Entity',
        user_id: 'user_123',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('entities');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should return error on failure', async () => {
      mockSupabaseClient.insert.mockResolvedValue({
        error: { message: 'Duplicate key' },
      });

      const result = await createEntity({
        name: 'Duplicate',
        user_id: 'user_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate key');
    });
  });

  describe('updateEntity', () => {
    it('should update entity successfully', async () => {
      mockSupabaseClient.update.mockResolvedValue({ error: null });

      const result = await updateEntity('entity_123', { name: 'Updated' });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ name: 'Updated' });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'entity_123');
    });
  });
});
```

## Step-by-Step: Unit Test for Handler

### 1. Create test file with mocked dependencies

```typescript
// src/features/[feature]/__tests__/[feature].handler.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock queries and commands
const mockGetEntity = vi.fn();
const mockUpdateEntity = vi.fn();

vi.mock('../[feature].query', () => ({
  getEntity: (...args) => mockGetEntity(...args),
}));

vi.mock('../[feature].command', () => ({
  updateEntity: (...args) => mockUpdateEntity(...args),
}));

import { handleUpdateEntity } from '../[feature].handler';
```

### 2. Write test cases

```typescript
describe('[feature].handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleUpdateEntity', () => {
    it('should update entity when authorized', async () => {
      // Mock entity exists and user owns it
      mockGetEntity.mockResolvedValue({
        id: 'entity_123',
        user_id: 'user_123',
      });
      mockUpdateEntity.mockResolvedValue({ success: true, error: null });

      const result = await handleUpdateEntity('user_123', 'entity_123', {
        name: 'Updated Name',
      });

      expect(result.success).toBe(true);
      expect(mockGetEntity).toHaveBeenCalledWith('entity_123');
      expect(mockUpdateEntity).toHaveBeenCalledWith('entity_123', {
        name: 'Updated Name',
      });
    });

    it('should fail when entity not found', async () => {
      mockGetEntity.mockResolvedValue(null);

      const result = await handleUpdateEntity('user_123', 'nonexistent', {
        name: 'Updated',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Entity not found');
      expect(mockUpdateEntity).not.toHaveBeenCalled();
    });

    it('should fail when user not authorized', async () => {
      mockGetEntity.mockResolvedValue({
        id: 'entity_123',
        user_id: 'other_user',
      });

      const result = await handleUpdateEntity('user_123', 'entity_123', {
        name: 'Updated',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized');
      expect(mockUpdateEntity).not.toHaveBeenCalled();
    });
  });
});
```

## Step-by-Step: Integration Test for API Route

### 1. Create test file

```typescript
// src/app/api/[route]/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from '@/test/mocks/supabase';

// Mock all external dependencies
vi.mock('@/shared/database/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve({
    get: (name: string) => {
      if (name === 'authorization') return 'Bearer token';
      return null;
    },
  }),
  cookies: () => Promise.resolve({
    get: () => ({ value: 'session' }),
  }),
}));

import { GET, POST } from '../route';
```

### 2. Write test cases

```typescript
describe('API Route /api/[route]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return data for authenticated user', async () => {
      // Mock auth
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      // Mock data
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: '123', name: 'Test' },
        error: null,
      });

      const request = new Request('http://localhost/api/route');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ id: '123', name: 'Test' });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/route');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create resource', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });
      mockSupabaseClient.insert.mockResolvedValue({ error: null });

      const request = new Request('http://localhost/api/route', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Resource' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});
```

## Step-by-Step: E2E Test

### 1. Create test file

```typescript
// tests/e2e/[feature].spec.ts
import { test, expect } from '@playwright/test';

// Test user (create in test setup or use seeded data)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};
```

### 2. Write test cases

```typescript
test.describe('[Feature]', () => {
  // Login before tests that need auth
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display feature page', async ({ page }) => {
    await page.goto('/feature');

    await expect(page.getByRole('heading', { name: /feature/i })).toBeVisible();
  });

  test('should create new item', async ({ page }) => {
    await page.goto('/feature');

    // Click create button
    await page.click('button:has-text("Create")');

    // Fill form
    await page.fill('input[name="name"]', 'Test Item');
    await page.fill('textarea[name="description"]', 'Test description');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.getByText('Test Item')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/feature');
    await page.click('button:has-text("Create")');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation error
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });
});
```

## Factory Patterns

### Creating Test Data

```typescript
// src/test/factories/user.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// src/test/factories/subscription.ts
export const createMockSubscription = (overrides = {}) => ({
  id: 'sub_123',
  user_id: 'user_123',
  status: 'active',
  stripe_customer_id: 'cus_123',
  stripe_price_id: 'price_123',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  ...overrides,
});
```

### Using Factories

```typescript
import { createMockUser } from '@/test/factories/user';
import { createMockSubscription } from '@/test/factories/subscription';

it('should handle user with active subscription', async () => {
  const user = createMockUser({ id: 'user_456' });
  const subscription = createMockSubscription({
    user_id: user.id,
    status: 'active',
  });

  setMockResponse(subscription);

  const result = await hasActiveSubscription(user.id);
  expect(result).toBe(true);
});
```

## Common Patterns

### Testing Validation

```typescript
import { schema } from '../types';

describe('validation', () => {
  it('should accept valid input', () => {
    const result = schema.safeParse({
      name: 'Valid Name',
      email: 'valid@email.com',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = schema.safeParse({
      name: 'Valid Name',
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });
});
```

### Testing Auth Guards

```typescript
describe('auth guard', () => {
  it('should allow authenticated user', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user_123' } },
      error: null,
    });

    const result = await protectedAction();

    expect(result.success).toBe(true);
  });

  it('should block unauthenticated user', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const result = await protectedAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });
});
```

## Checklist

Before submitting PR with tests:

- [ ] All tests pass (`npm run test`)
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] No console.log in tests
- [ ] Mock data is realistic
- [ ] Test names are descriptive
- [ ] No hardcoded timeouts (use waitFor)
