# CQRS Pattern Guide

## Overview

Command Query Responsibility Segregation (CQRS) separates read and write operations into different models.

## Why CQRS?

1. **Clarity**: Clear separation of concerns
2. **Optimization**: Reads and writes can be optimized independently
3. **Scalability**: Can scale read and write paths separately
4. **Maintainability**: Easier to reason about and test

## The Four Files

### 1. Query (`.query.ts`)

**Purpose**: Read data from the database

```typescript
// feature.query.ts
import { createClientServer } from '@/shared/database/supabase';

export async function getFeature(id: string) {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('features')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function listFeatures(userId: string) {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('features')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}
```

### 2. Command (`.command.ts`)

**Purpose**: Write data to the database

```typescript
// feature.command.ts
import { createClientServer } from '@/shared/database/supabase';
import type { FeatureInput } from './types';

export async function createFeature(userId: string, input: FeatureInput) {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('features')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateFeature(id: string, input: Partial<FeatureInput>) {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('features')
    .update(input)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function deleteFeature(id: string) {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('features')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
```

### 3. Handler (`.handler.ts`)

**Purpose**: Business logic orchestration

```typescript
// feature.handler.ts
import { getFeature, listFeatures } from './feature.query';
import { createFeature, updateFeature, deleteFeature } from './feature.command';
import { featureSchema, type FeatureInput } from './types';

export async function handleGetFeature(id: string) {
  return getFeature(id);
}

export async function handleListFeatures(userId: string) {
  return listFeatures(userId);
}

export async function handleCreateFeature(userId: string, input: FeatureInput) {
  // Validate input
  const validation = featureSchema.safeParse(input);
  if (!validation.success) {
    return {
      data: null,
      error: validation.error.errors[0].message
    };
  }

  // Business rules
  if (input.name.toLowerCase().includes('test')) {
    return {
      data: null,
      error: 'Name cannot contain "test"'
    };
  }

  // Execute command
  return createFeature(userId, validation.data);
}

export async function handleUpdateFeature(id: string, input: Partial<FeatureInput>) {
  const validation = featureSchema.partial().safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message
    };
  }

  return updateFeature(id, validation.data);
}

export async function handleDeleteFeature(id: string) {
  // Could add business rules here
  // e.g., check if feature can be deleted
  return deleteFeature(id);
}
```

### 4. Actions (`.actions.ts`)

**Purpose**: Server Actions (entry points for client)

```typescript
// feature.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import {
  handleGetFeature,
  handleListFeatures,
  handleCreateFeature,
  handleUpdateFeature,
  handleDeleteFeature
} from './feature.handler';

export async function getFeatureAction(id: string) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  return handleGetFeature(id);
}

export async function listFeaturesAction() {
  const user = await getUser();
  if (!user) {
    return { data: [], error: 'Not authenticated' };
  }

  return handleListFeatures(user.id);
}

export async function createFeatureAction(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const input = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  };

  const result = await handleCreateFeature(user.id, input);

  if (result.data) {
    revalidatePath('/features');
  }

  return result;
}

export async function updateFeatureAction(id: string, formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const input = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  };

  const result = await handleUpdateFeature(id, input);

  if (result.success) {
    revalidatePath('/features');
  }

  return result;
}

export async function deleteFeatureAction(id: string) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleDeleteFeature(id);

  if (result.success) {
    revalidatePath('/features');
  }

  return result;
}
```

## Flow Summary

```
Client Component
    ↓
Server Action (auth check, extract input)
    ↓
Handler (validate, business logic)
    ↓
Command/Query (database operation)
    ↓
Response back up the chain
```

## Testing

Each layer can be tested independently:

- **Queries/Commands**: Test database operations
- **Handlers**: Test business logic with mocked queries/commands
- **Actions**: Integration tests with full flow
