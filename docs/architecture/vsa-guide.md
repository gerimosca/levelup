# Vertical Slice Architecture (VSA) Guide

## Overview

VSA organizes code by feature rather than by technical layer. Each "slice" contains everything needed for a specific feature.

## Why VSA?

1. **Cohesion**: Related code stays together
2. **Maintainability**: Changes are localized to one folder
3. **Scalability**: Add features without touching existing code
4. **Team autonomy**: Teams can own entire features

## Structure of a Slice

```
/src/features/[feature-name]/
├── components/           # UI components
│   ├── feature-form.tsx
│   ├── feature-list.tsx
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── [feature].command.ts # Write operations
├── [feature].query.ts   # Read operations
├── [feature].handler.ts # Business logic
├── [feature].actions.ts # Server Actions
└── index.ts             # Public API
```

## Creating a New Slice

### Option 1: Generator (recommended)

```bash
npm run generate:slice
```

### Option 2: Manual

1. Create folder in `/src/features/`
2. Add required files following the pattern
3. Export from `index.ts`

## Best Practices

### 1. Keep slices independent

Each slice should be self-contained. If you need to share logic, move it to `/src/shared/`.

### 2. Use the index.ts as public API

Only export what other parts of the app need:

```typescript
// index.ts
export { FeatureForm } from './components';
export { featureAction } from './feature.actions';
export type { Feature } from './types';
```

### 3. Follow CQRS strictly

- **Query**: Only reads data
- **Command**: Only writes data
- **Handler**: Orchestrates both

### 4. Validate at the edge

Use Zod schemas in handlers to validate input before any operation:

```typescript
export async function handleCreateFeature(input: FeatureInput) {
  const validation = featureSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.message };
  }
  return createFeature(validation.data);
}
```

### 5. Types go in /types

Keep all TypeScript types and Zod schemas in the types folder for easy discovery.

## When to Create a New Slice

Create a new slice when:
- Adding a new business capability
- The feature is distinct from existing ones
- It could potentially be developed independently

Don't create a new slice when:
- It's just a UI variation
- It's tightly coupled to an existing feature
- It's infrastructure (use `/src/shared/`)

## Example: Adding a "Projects" Feature

1. Run `npm run generate:slice` and enter "projects"
2. Define types in `types/index.ts`
3. Implement queries in `projects.query.ts`
4. Implement commands in `projects.command.ts`
5. Add business logic in `projects.handler.ts`
6. Create server actions in `projects.actions.ts`
7. Build components in `components/`
8. Add pages in `src/app/[locale]/(app)/projects/`
