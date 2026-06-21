# Providers

Estado global de la aplicación usando React Context.

## AppProvider

Provider que maneja el estado global de usuario, subscription y credits.

**Nota:** ThemeProvider y Toaster están en el root layout (`src/app/[locale]/layout.tsx`).
AppProvider se usa solo en el layout de la app (`src/app/[locale]/(app)/layout.tsx`)
para pasar el estado del usuario autenticado.

## Uso

### Acceder al estado global

```typescript
import { useApp, useSubscription, useCredits } from '@/shared/providers';

function MyComponent() {
  // Acceso completo
  const { user, subscription, credits } = useApp();

  // O acceso específico
  const subscription = useSubscription();
  const credits = useCredits();

  if (subscription?.plan === 'pro') {
    // Mostrar features pro
  }
}
```

### Pasar estado inicial

En el layout, pasa los datos del servidor:

```typescript
// src/app/[locale]/(app)/layout.tsx
import { AppProvider } from '@/shared/providers';
import { getUser, getSubscription } from '@/shared/auth';

export default async function AppLayout({ children }) {
  const user = await getUser();
  const subscription = user ? await getSubscription(user.id) : null;

  return (
    <AppProvider
      initialState={{
        user: user ? { id: user.id, email: user.email } : null,
        subscription,
        credits: 100,
      }}
    >
      {children}
    </AppProvider>
  );
}
```

## Toast Notifications

Usa `sonner` para mostrar notificaciones:

```typescript
import { toast } from 'sonner';

// En un server action o componente
toast.success('Perfil actualizado');
toast.error('Error al guardar');
toast.info('Procesando...');
toast.warning('Límite casi alcanzado');

// Con descripción
toast.success('Guardado', {
  description: 'Tus cambios han sido guardados correctamente',
});
```

## Dark Mode

### Toggle simple

```typescript
import { ThemeToggle } from '@/shared/components/ui';

// Botón que cicla entre light/dark/system
<ThemeToggle />
```

### Selector completo

```typescript
import { ThemeSelect } from '@/shared/components/ui';

// Tres botones para elegir
<ThemeSelect />
```

### Uso directo

```typescript
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle
    </button>
  );
}
```

## Tipos

```typescript
interface AppState {
  user: AppUser | null;
  subscription: AppSubscription | null;
  credits: number;
}

interface AppUser {
  id: string;
  email: string;
  avatar_url?: string;
}

interface AppSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  features: string[];
  current_period_end?: string;
}
```

## Añadir más estado

Para añadir nuevo estado global:

1. Actualiza la interfaz `AppState` en `app-provider.tsx`
2. Añade el valor por defecto en `defaultState`
3. Opcionalmente, crea un hook específico (ej: `useNewState`)
4. Actualiza los layouts que pasen `initialState`

Ejemplo:

```typescript
// 1. En app-provider.tsx
interface AppState {
  // ... existente
  notifications: Notification[];
}

// 2. Default
const defaultState: AppState = {
  // ... existente
  notifications: [],
};

// 3. Hook específico
export function useNotifications() {
  const { notifications } = useApp();
  return notifications;
}
```

## Actualizar estado

El estado se actualiza via `revalidatePath()` después de mutaciones:

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function upgradeSubscription() {
  // Actualizar en DB
  await updateSubscriptionInDB(userId, 'pro');

  // Invalidar para que se re-obtengan los datos
  revalidatePath('/dashboard');
}
```

Esto hace que el layout vuelva a obtener los datos frescos y los pase al provider.
