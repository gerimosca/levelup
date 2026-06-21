# Architecture: VSA + CQRS

## Overview

This SaaS boilerplate uses **Vertical Slice Architecture (VSA)** combined with **CQRS** pattern:

```
src/
├── features/       # Feature slices (VSA + CQRS)
├── shared/         # Shared utilities (auth, db, components)
├── app/            # Next.js App Router
├── i18n/           # Internationalization
└── test/           # Test utilities
```

## Key Principles

### 1. Feature Isolation

Each feature is self-contained and doesn't depend on other features:

```
features/
├── auth/           # Authentication
├── billing/        # Stripe subscriptions
├── dashboard/      # User dashboard
├── admin/          # Admin panel
├── home/           # Landing page
├── my-account/     # User profile
├── analytics/      # Analytics tracking
├── attribution/    # Attribution tracking
└── affiliates/     # Affiliate program
```

### 2. CQRS Pattern

Every feature follows this structure:

```
feature-name/
├── types/index.ts              # Zod schemas + TS types
├── feature-name.query.ts       # Read operations (SELECT)
├── feature-name.command.ts     # Write operations (INSERT/UPDATE/DELETE)
├── feature-name.handler.ts     # Business logic + validation
├── feature-name.actions.ts     # Server Actions (entry points)
├── components/                 # UI components
└── CLAUDE.md                   # Feature-specific context
```

### 3. Shared Utilities

Common code used across features:

```
shared/
├── auth/              # Authentication helpers (getUser, requireUser)
├── components/ui/     # shadcn/ui components
├── config/            # App configuration (brand, etc.)
├── database/supabase/ # Supabase clients
├── payments/stripe/   # Stripe integration
├── types/             # Shared TypeScript types
└── lib/               # Utility functions
```

## Import Rules

### Allowed Imports

```typescript
// Feature importing from shared
import { Button } from '@/shared/components/ui';
import { getUser } from '@/shared/auth';
import { createClientServer } from '@/shared/database/supabase';

// App routes importing from features
import { LoginForm } from '@/features/auth';
import { DashboardStats } from '@/features/dashboard';
```

### Forbidden Imports

```typescript
// Cross-feature imports (features should be isolated)
// In features/auth/
import { something } from '@/features/billing'; // ❌

// Feature importing from another feature's internals
import { someHelper } from '@/features/admin/utils'; // ❌
```

## App Router Structure

```
app/[locale]/
├── (landing)/         # Public pages (/, /pricing, etc.)
├── (app)/             # Protected pages (/dashboard, /billing)
├── (auth)/            # Auth pages (/login, /register)
└── (admin)/           # Admin pages (/admin, /admin/users)
```

Routes import directly from `@/features/`:

```typescript
// app/[locale]/(app)/dashboard/page.tsx
import { DashboardStats } from '@/features/dashboard';

export default function DashboardPage() {
  return <DashboardStats />;
}
```

## Validation

ESLint enforces architecture rules:

```bash
npm run lint
```

Catches:
- Cross-feature imports in `features/`
- Ensures proper import patterns

## VSA + CQRS Pattern Examples

### Types (`types/index.ts`)

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Query (`feature.query.ts`)

Read operations only:

```typescript
import { createClientServer } from '@/shared/database/supabase';

export async function getUser(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error: error?.message || null };
}
```

### Command (`feature.command.ts`)

Write operations only:

```typescript
import { createClientServer } from '@/shared/database/supabase';
import { CreateUserInput } from './types';

export async function createUser(input: CreateUserInput) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('users')
    .insert(input);

  return {
    success: !error,
    error: error?.message || null
  };
}
```

### Handler (`feature.handler.ts`)

Business logic + validation:

```typescript
import { createUserSchema, CreateUserInput } from './types';
import { createUser } from './feature.command';

export async function handleCreateUser(input: CreateUserInput) {
  const validation = createUserSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    };
  }

  return createUser(validation.data);
}
```

### Actions (`feature.actions.ts`)

Server Actions (entry points):

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { handleCreateUser } from './feature.handler';

export async function createUserAction(prevState: any, formData: FormData) {
  const input = {
    email: formData.get('email') as string,
    name: formData.get('name') as string
  };

  const result = await handleCreateUser(input);

  if (result.success) {
    revalidatePath('/users');
  }

  return result;
}
```

## Benefits

1. **Feature Isolation**: Features don't depend on each other
2. **Clear Responsibilities**: Query vs Command vs Handler vs Action
3. **Type Safety**: Zod validation + TypeScript throughout
4. **Testability**: Each layer can be tested independently
5. **Scalability**: Add features without touching existing code
6. **Maintainability**: Easy to find and modify code

## TypeScript Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

## Adding New Features

1. Create feature directory in `src/features/`
2. Follow the VSA + CQRS structure
3. Create route in `app/[locale]/`
4. Add translations in route's `copies/` directory
5. Run `npm run lint` to validate

---

For more information:
- `CLAUDE.md` - Development guidelines and patterns
- Feature-specific `CLAUDE.md` files in each feature directory
