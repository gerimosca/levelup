# Billing Feature

Sistema de pagos y suscripciones con Stripe.

## Funcionalidades

- Suscripciones con Stripe Checkout
- Stripe Pricing Table embebida
- Sincronización de estado vía webhooks
- Control de acceso por suscripción
- Customer Portal de Stripe

## Estructura

```
billing/
├── components/
│   ├── stripe-pricing-table.tsx  # Pricing table embebida
│   └── subscription-status.tsx   # Badge de estado
├── types/
│   └── index.ts                  # Tipos y schemas
├── billing.query.ts              # getSubscription, getCustomer
├── billing.command.ts            # upsertCustomer, upsertSubscription
├── billing.handler.ts            # handlePortalSession
├── billing.actions.ts            # portalAction
└── index.ts
```

## Base de Datos

### Tablas

**customers** - Mapeo usuario ↔ Stripe
- `user_id` (UUID) - FK a auth.users
- `stripe_customer_id` (TEXT) - ID del customer en Stripe

**subscriptions** - Estado de suscripciones
- `id` (TEXT) - subscription_id de Stripe
- `user_id` (UUID) - FK a auth.users
- `stripe_customer_id` (TEXT)
- `stripe_price_id` (TEXT)
- `status` (TEXT) - active, trialing, past_due, canceled, etc.
- `current_period_start` / `current_period_end` (TIMESTAMPTZ)
- `cancel_at_period_end` (BOOLEAN)

### Migración

```bash
npx supabase db push
```

## Configuración

### Variables de Entorno

```bash
# Requeridas
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_...

# Ya existente
SUPABASE_SERVICE_ROLE_KEY=...  # Para webhooks
```

### Stripe Dashboard

1. **Productos y Precios**
   - Crear productos (ej: Pro, Enterprise)
   - Crear precios (mensual/anual)

2. **Pricing Table**
   - Product catalog → Pricing tables → Create
   - Agregar productos/precios
   - Copiar `pricing-table-id`

3. **Webhook**
   - Developers → Webhooks → Add endpoint
   - URL: `https://tu-dominio.com/api/webhooks/stripe`
   - Eventos:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

4. **Customer Portal**
   - Settings → Billing → Customer portal
   - Configurar opciones (cancelar, cambiar plan, etc.)

## Uso

### Pricing Table

```tsx
import { StripePricingTable } from '@/features/billing';

export default function PricingPage() {
  const user = await getUser();

  return <StripePricingTable userId={user?.id || ''} />;
}
```

### Verificar Suscripción

```tsx
import { hasActiveSubscription } from '@/features/billing';

const isSubscribed = await hasActiveSubscription(userId);
```

### Proteger Rutas

```tsx
import { requireSubscription } from '@/shared/auth';

export default async function PremiumPage({ params }) {
  const { locale } = await params;
  await requireSubscription(locale);

  // Usuario tiene suscripción activa
  return <PremiumContent />;
}
```

### Customer Portal

```tsx
// Desde un formulario
<form action="/api/billing/portal" method="POST">
  <button type="submit">Manage Subscription</button>
</form>

// O con server action
import { portalAction } from '@/features/billing';

<form action={portalAction}>
  <button type="submit">Manage Subscription</button>
</form>
```

### Subscription Status Badge

```tsx
import { SubscriptionStatusBadge } from '@/features/billing';

export default function Header() {
  const user = await getUser();

  return (
    <header>
      <SubscriptionStatusBadge userId={user.id} />
    </header>
  );
}
```

## Páginas

- `/pricing` - Pricing table pública
- `/billing` - Dashboard de billing (protegida)
- `/checkout/success` - Confirmación post-pago

## Flujo de Pago

```
1. Usuario ve Pricing Table → /pricing
2. Selecciona plan → Stripe Checkout
3. Completa pago → Stripe
4. Webhook recibe evento → checkout.session.completed
5. Crea customer + subscription en DB
6. Redirige a → /checkout/success
7. Usuario tiene acceso a features premium
```

## Webhooks

El endpoint `/api/webhooks/stripe` maneja:

| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Crear customer y subscription |
| `customer.subscription.updated` | Actualizar status y período |
| `customer.subscription.deleted` | Marcar como canceled |
| `invoice.payment_failed` | Marcar como past_due |

## Estados de Suscripción

| Status | Significado | Acceso |
|--------|-------------|--------|
| `active` | Pagando normalmente | ✅ |
| `trialing` | En período de prueba | ✅ |
| `past_due` | Pago fallido | ⚠️ Limitado |
| `canceled` | Cancelada | ❌ |
| `unpaid` | Sin pagar | ❌ |

## Testing

### Stripe CLI

```bash
# Escuchar webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Simular eventos
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

### Test Cards

- `4242424242424242` - Pago exitoso
- `4000000000000341` - Pago fallido

## Extender

### Agregar Límites de Uso

```typescript
// En billing.query.ts
export async function getUsageLimit(userId: string): Promise<number> {
  const subscription = await getSubscription(userId);

  if (!subscription) return 10; // Free tier

  // Mapear price_id a límites
  const limits: Record<string, number> = {
    'price_pro': 100,
    'price_enterprise': 1000,
  };

  return limits[subscription.stripe_price_id] || 10;
}
```

### Notificaciones de Pago Fallido

```typescript
// En webhook, case 'invoice.payment_failed':
await sendEmail({
  to: user.email,
  template: 'payment-failed',
  data: { invoiceUrl: invoice.hosted_invoice_url }
});
```

### Múltiples Productos

Si necesitas más de un producto por usuario, modifica la tabla `subscriptions` para permitir múltiples registros activos por usuario.
