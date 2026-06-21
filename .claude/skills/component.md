# Skill: Crear Componente con Form

Guía para crear componentes React con Server Actions.

## Template: Form con useActionState

```typescript
'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { createXAction } from '../x.actions';

export function XForm() {
  const t = useTranslations('x');
  const [state, action, pending] = useActionState(createXAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t('messages.created'));
      // Opcional: reset form, redirect, etc.
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t('form.title')}</Label>
        <Input
          id="title"
          name="title"
          placeholder={t('form.titlePlaceholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t('form.descriptionPlaceholder')}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? t('actions.creating') : t('actions.create')}
      </Button>
    </form>
  );
}
```

## Template: Form de Edición

```typescript
'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { updateXAction } from '../x.actions';
import { X } from '../types';

interface XEditFormProps {
  item: X;
}

export function XEditForm({ item }: XEditFormProps) {
  const t = useTranslations('x');
  const [state, action, pending] = useActionState(updateXAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t('messages.updated'));
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  return (
    <form action={action} className="space-y-4">
      {/* Hidden field para el ID */}
      <input type="hidden" name="id" value={item.id} />

      <div className="space-y-2">
        <Label htmlFor="title">{t('form.title')}</Label>
        <Input
          id="title"
          name="title"
          defaultValue={item.title}
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? t('actions.saving') : t('actions.save')}
      </Button>
    </form>
  );
}
```

## Template: Botón de Acción (Delete)

```typescript
'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteXAction } from '../x.actions';

interface DeleteXButtonProps {
  id: string;
}

export function DeleteXButton({ id }: DeleteXButtonProps) {
  const t = useTranslations('x');
  const [state, action, pending] = useActionState(deleteXAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t('messages.deleted'));
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

## Template: Lista con Server Component

```typescript
// Este es un Server Component (sin 'use client')
import { getUser } from '@/shared/auth';
import { listXs } from '../x.query';
import { XCard } from './x-card';

export async function XList() {
  const user = await getUser();
  if (!user) return null;

  const { data: items, error } = await listXs(user.id);

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground">No items yet</p>;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <XCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Template: Card Item

```typescript
import { X } from '../types';
import { DeleteXButton } from './delete-x-button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';

interface XCardProps {
  item: X;
}

export function XCard({ item }: XCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{item.title}</CardTitle>
        <DeleteXButton id={item.id} />
      </CardHeader>
      {item.description && (
        <CardContent>
          <p className="text-muted-foreground">{item.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
```

## Template: Página Completa

```typescript
// src/app/[locale]/(app)/xs/page.tsx
import { getTranslations } from 'next-intl/server';
import { XForm } from '@/features/x/components/x-form';
import { XList } from '@/features/x/components/x-list';

export default async function XsPage() {
  const t = await getTranslations('x');

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('createNew')}</h2>
          <XForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('yourItems')}</h2>
          <XList />
        </div>
      </div>
    </div>
  );
}
```

## Componentes shadcn/ui Comunes

```bash
# Instalar componentes necesarios
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

## Patrones Importantes

### 1. Siempre usar useTranslations
```typescript
const t = useTranslations('namespace');
// NUNCA: <Button>Submit</Button>
// SIEMPRE: <Button>{t('actions.submit')}</Button>
```

### 2. Manejar estados de loading
```typescript
<Button disabled={pending}>
  {pending ? t('loading') : t('submit')}
</Button>
```

### 3. Feedback con toast
```typescript
useEffect(() => {
  if (state?.success) toast.success(message);
  if (state?.error) toast.error(state.error);
}, [state]);
```

### 4. Formularios accesibles
```typescript
<Label htmlFor="field">Label</Label>
<Input id="field" name="field" />
```
