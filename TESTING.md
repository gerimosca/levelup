# Testing Guide

This document describes the testing strategy and conventions for the SaaS Boilerplate.

## Overview

The project uses a multi-layer testing approach:

| Type | Tool | Location | Purpose |
|------|------|----------|---------|
| Unit | Vitest | `src/**/__tests__/*.test.ts` | Test isolated business logic |
| Integration | Vitest | `src/app/api/**/__tests__/*.test.ts` | Test API routes and webhooks |
| E2E | Playwright | `tests/e2e/*.spec.ts` | Test complete user flows |

## Running Tests

```bash
# Unit and integration tests
npm run test              # Run once
npm run test:ui           # Visual test runner
npm run test:coverage     # With coverage report

# E2E tests
npm run test:e2e          # Run headless
npm run test:e2e:ui       # Visual runner
```

## Project Structure

```
src/
├── test/                           # Test utilities
│   ├── setup.ts                    # Global test setup
│   └── mocks/
│       ├── supabase.ts             # Supabase client mock
│       └── stripe.ts               # Stripe SDK mock + factories
├── features/
│   └── [feature]/
│       └── __tests__/              # Feature unit tests
│           ├── [feature].query.test.ts
│           ├── [feature].command.test.ts
│           └── [feature].handler.test.ts
└── app/
    └── api/
        └── [route]/
            └── __tests__/          # API route tests
                └── route.test.ts

tests/
└── e2e/                            # E2E tests
    ├── auth.spec.ts
    └── billing.spec.ts
```

## Test Types

### Unit Tests

Test isolated business logic in handlers, queries, and commands.

```typescript
// src/features/billing/__tests__/billing.query.test.ts
import { describe, it, expect } from 'vitest';
import { mockSupabaseClient, setMockResponse } from '@/test/mocks/supabase';
import { getSubscription } from '../billing.query';

describe('getSubscription', () => {
  it('should return subscription for user', async () => {
    setMockResponse({ id: 'sub_123', status: 'active' });

    const result = await getSubscription('user_123');

    expect(result).toEqual({ id: 'sub_123', status: 'active' });
  });
});
```

### Integration Tests

Test complete API routes with mocked external services.

```typescript
// src/app/api/webhooks/stripe/__tests__/route.test.ts
import { describe, it, expect } from 'vitest';
import { mockStripe, createMockStripeEvent } from '@/test/mocks/stripe';
import { POST } from '../route';

describe('Stripe Webhook', () => {
  it('should handle checkout.session.completed', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      client_reference_id: 'user_123',
      subscription: 'sub_123',
    });

    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    const response = await POST(createMockRequest(event));

    expect(response.status).toBe(200);
  });
});
```

### E2E Tests

Test complete user flows in a real browser.

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Mocking

### Supabase Mock

```typescript
import { mockSupabaseClient, setMockResponse } from '@/test/mocks/supabase';

// Set response for queries
setMockResponse({ id: '123', name: 'Test' });

// Check calls
expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '123');
```

### Stripe Mock

```typescript
import {
  mockStripe,
  createMockSubscription,
  createMockCheckoutSession,
  createMockStripeEvent
} from '@/test/mocks/stripe';

// Create mock objects
const subscription = createMockSubscription({ status: 'active' });
const session = createMockCheckoutSession({ customer: 'cus_123' });
const event = createMockStripeEvent('checkout.session.completed', session);

// Mock Stripe API calls
mockStripe.subscriptions.retrieve.mockResolvedValue(subscription);
mockStripe.webhooks.constructEvent.mockReturnValue(event);
```

## Coverage

Target coverage by file type:

| File Type | Target | Reason |
|-----------|--------|--------|
| `*.handler.ts` | 80%+ | Critical business logic |
| `*.query.ts` | 80%+ | Data access logic |
| `*.command.ts` | 80%+ | State mutations |
| `*.actions.ts` | 60%+ | Server actions (thin wrappers) |
| Components | 40%+ | UI behavior |

Run coverage report:

```bash
npm run test:coverage
```

Coverage report is generated in `coverage/` directory.

## Best Practices

### Do

- Test behavior, not implementation
- Use descriptive test names that explain the scenario
- Keep tests independent (no shared state)
- Mock external services (Supabase, Stripe)
- Test error cases and edge cases
- Use factories for complex test data

### Don't

- Test trivial code (simple getters/setters)
- Test framework code (Next.js, React)
- Share state between tests
- Use real external services in unit tests
- Write tests that depend on test order

## Workflow

### New Feature

1. Create feature with `/new-feature` command
2. Implement business logic
3. Write unit tests for handlers/queries/commands
4. Write integration tests for API routes
5. Run `npm run test` before PR

### Bug Fix

1. Write test that reproduces the bug
2. Verify test fails
3. Fix the bug
4. Verify test passes
5. Commit with test

### Before Deploy

```bash
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run build
```

## CI/CD

Tests run automatically on:

- **Pull Request**: Unit tests + lint + type-check
- **Merge to main**: Full test suite including E2E
- **Deploy**: Smoke tests

## Environment

Tests use these environment variables (set in `src/test/setup.ts`):

```
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
STRIPE_SECRET_KEY=sk_test_123
STRIPE_WEBHOOK_SECRET=whsec_test123
```

## Troubleshooting

### Tests fail with "Cannot find module"

Check path aliases in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Mock not working

Ensure mock is imported before the module that uses it:

```typescript
// This import must come first
import { mockSupabaseClient } from '@/test/mocks/supabase';

// Then import the module under test
import { getUser } from '../user.query';
```

### E2E tests timeout

Increase timeout in test:

```typescript
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
