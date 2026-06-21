# Error Handling System

Sistema estandarizado de manejo de errores con soporte i18n y notificaciones toast.

## Estructura

```
src/shared/errors/
├── types.ts           # AppError, Result<T>, ActionState
├── codes.ts           # BaseErrorCode (validation, db, generic)
├── factory.ts         # createError(), fromZodError(), isAppError()
├── toast.ts           # showError(), showSuccess() (Sonner)
├── messages/
│   ├── en.ts          # English messages
│   ├── es.ts          # Spanish messages
│   └── index.ts       # getErrorMessage()
└── index.ts           # Barrel export
```

## Error Codes por Dominio

| Rango | Dominio | Ubicación |
|-------|---------|-----------|
| VAL_2xxx | Validation | `/shared/errors/codes.ts` |
| DB_4xxx | Database | `/shared/errors/codes.ts` |
| ERR_9xxx | Generic | `/shared/errors/codes.ts` |
| AUTH_1xxx | Authentication | `/features/auth/types/errors.ts` |
| BILL_3xxx | Billing | (definir en feature) |
| AI_5xxx | AI/ML | (definir en feature) |

## Uso

### En un Handler

```typescript
import { createError, fromZodError } from '@/shared/errors';
import { AuthErrorCode } from './types';

export async function handleLogin(email: string, password: string): Promise<AuthState> {
  // 1. Validar con Zod
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      error: fromZodError(result.error),  // Convierte ZodError a AppError
    };
  }

  // 2. Llamar al command
  const { user, error } = await signInWithPassword(result.data);

  // 3. Manejar error específico del feature
  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.INVALID_CREDENTIALS, error),
    };
  }

  return { success: true, message: `Welcome back, ${user?.email}!` };
}
```

### En un Componente (mostrar inline)

```typescript
'use client';
import { getErrorMessage } from '@/shared/errors';

export function LoginForm() {
  const locale = useLocale();
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="text-destructive">
          {getErrorMessage(state.error.code, locale)}
        </div>
      )}
      {/* ... */}
    </form>
  );
}
```

### En un Componente (mostrar toast)

```typescript
'use client';
import { showError, showSuccess } from '@/shared/errors';

export function SomeComponent() {
  const locale = useLocale();

  const handleAction = async () => {
    const result = await someAction();

    if (!result.success) {
      showError(result.error, locale);
      return;
    }

    showSuccess('Operation completed');
  };
}
```

## Crear Errores para un Nuevo Feature

### 1. Crear enum de códigos

```typescript
// src/features/billing/types/errors.ts
export enum BillingErrorCode {
  NO_CUSTOMER = 'BILL_3001',
  LIMIT_EXCEEDED = 'BILL_3002',
  SUBSCRIPTION_REQUIRED = 'BILL_3003',
  PAYMENT_FAILED = 'BILL_3004',
}
```

### 2. Exportar en types/index.ts

```typescript
// src/features/billing/types/index.ts
export { BillingErrorCode } from './errors';
```

### 3. Agregar mensajes i18n

```typescript
// src/shared/errors/messages/en.ts
export const en = {
  // ... existing

  // Billing errors
  BILL_3001: 'No payment method on file',
  BILL_3002: 'You have reached your usage limit',
  // ...
};

// src/shared/errors/messages/es.ts
export const es = {
  // ... existing

  // Billing errors
  BILL_3001: 'No hay método de pago registrado',
  BILL_3002: 'Has alcanzado tu límite de uso',
  // ...
};
```

## Tipos

### AppError

```typescript
type AppError = {
  code: string;        // Código único (ej: 'AUTH_1001')
  message: string;     // Mensaje técnico (para logs)
  details?: Record<string, unknown>;  // Info adicional
};
```

### Result<T>

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };
```

### ActionState

```typescript
type ActionState = {
  success: boolean;
  error?: AppError;
  message?: string;
};
```

## Helpers Disponibles

| Helper | Uso |
|--------|-----|
| `createError(code, message, details?)` | Crear AppError manualmente |
| `fromZodError(zodError)` | Convertir ZodError a AppError |
| `isAppError(value)` | Type guard |
| `getErrorMessage(code, locale)` | Obtener mensaje i18n |
| `showError(error, locale)` | Toast de error |
| `showSuccess(message)` | Toast de éxito |
| `showWarning(message)` | Toast de advertencia |
| `showInfo(message)` | Toast informativo |

## Principios

1. **Errores específicos en cada feature** - Los códigos AUTH_*, BILL_*, AI_* se definen en su feature
2. **Errores genéricos en shared** - VAL_*, DB_*, ERR_* son compartidos
3. **Mensajes centralizados** - Todos los mensajes i18n van en `/shared/errors/messages/`
4. **Handler retorna AppError** - Nunca strings directamente
5. **Componente traduce** - Usa `getErrorMessage()` para mostrar al usuario
