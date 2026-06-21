# Testing de Billing

Guía para probar la integración de Stripe en desarrollo local.

## Setup Inicial

### 1. Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Descargar desde https://stripe.com/docs/stripe-cli

# Windows
# scoop install stripe
```

### 2. Login en Stripe

```bash
stripe login
```

Se abrirá el navegador para autenticarte con tu cuenta de Stripe.

### 3. Verificar instalación

```bash
stripe --version
```

## Pasos para Probar

### Terminal 1: Servidor de desarrollo

```bash
npm run dev
```

### Terminal 2: Escuchar webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Verás un output como:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

**Importante**: Copia el `whsec_...` y actualiza tu `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

Reinicia el servidor de desarrollo después de cambiar el secret.

### Terminal 3 (opcional): Simular eventos

```bash
stripe trigger <evento>
```

## Casos de Uso

### 1. Checkout Exitoso

**Objetivo**: Verificar que el flujo completo de suscripción funciona.

**Pasos**:
1. Navega a `/es/pricing` o `/en/pricing`
2. Selecciona un plan
3. En el checkout de Stripe, usa:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura (ej: 12/34)
   - CVC: cualquier 3 dígitos (ej: 123)
   - Nombre: cualquier nombre
4. Completa el pago

**Verificaciones**:
- [ ] Redirige a `/checkout/success`
- [ ] En Stripe CLI ves `checkout.session.completed` con status 200
- [ ] En la base de datos:
  ```sql
  SELECT * FROM customers WHERE user_id = 'tu-user-id';
  SELECT * FROM subscriptions WHERE user_id = 'tu-user-id';
  ```
- [ ] La página `/billing` muestra la suscripción activa

---

### 2. Pago Fallido

**Objetivo**: Verificar que se marca la suscripción como `past_due`.

**Opción A - Con tarjeta de fallo**:
1. En el checkout usa: `4000 0000 0000 0341`
2. Esta tarjeta siempre falla

**Opción B - Simular evento**:
```bash
stripe trigger invoice.payment_failed
```

**Verificaciones**:
- [ ] En Stripe CLI ves `invoice.payment_failed` con status 200
- [ ] En la base de datos:
  ```sql
  SELECT status FROM subscriptions WHERE user_id = 'tu-user-id';
  -- Debería ser 'past_due'
  ```
- [ ] La página `/billing` muestra "Payment Failed"

---

### 3. Cancelación de Suscripción

**Objetivo**: Verificar que se actualiza el status a `canceled`.

**Opción A - Desde Customer Portal**:
1. Ve a `/billing`
2. Click en "Manage Subscription"
3. Cancela la suscripción en el portal de Stripe

**Opción B - Simular evento**:
```bash
stripe trigger customer.subscription.deleted
```

**Verificaciones**:
- [ ] En Stripe CLI ves `customer.subscription.deleted` con status 200
- [ ] En la base de datos:
  ```sql
  SELECT status FROM subscriptions WHERE id = 'sub_xxx';
  -- Debería ser 'canceled'
  ```

---

### 4. Actualización de Suscripción

**Objetivo**: Verificar que los cambios de plan se sincronizan.

**Pasos**:
1. Ve a `/billing`
2. Click en "Manage Subscription"
3. Cambia a otro plan en el Customer Portal

**O simular**:
```bash
stripe trigger customer.subscription.updated
```

**Verificaciones**:
- [ ] En Stripe CLI ves `customer.subscription.updated` con status 200
- [ ] En la base de datos se actualiza `stripe_price_id` y `current_period_end`

---

### 5. Período de Prueba (Trial)

**Objetivo**: Verificar que los trials funcionan correctamente.

**Setup**:
1. En Stripe Dashboard, configura un precio con trial period
2. Crea un checkout con ese precio

**Verificaciones**:
- [ ] `subscription.status` es `trialing`
- [ ] `trial_end` tiene la fecha correcta
- [ ] El usuario tiene acceso a features premium

---

### 6. Renovación Automática

**Objetivo**: Verificar que la renovación actualiza el período.

**Simular**:
```bash
stripe trigger invoice.payment_succeeded
```

**Verificaciones**:
- [ ] `current_period_start` y `current_period_end` se actualizan

---

### 7. Webhook Duplicado (Idempotencia)

**Objetivo**: Verificar que eventos duplicados no causan problemas.

**Pasos**:
1. Completa un checkout exitoso
2. En Stripe Dashboard, ve a Developers → Webhooks → Events
3. Busca el evento `checkout.session.completed`
4. Click en "Resend"

**Verificaciones**:
- [ ] No se crean registros duplicados en la base de datos
- [ ] El webhook retorna 200 (procesado o ignorado)

---

### 8. Control de Acceso

**Objetivo**: Verificar que las rutas protegidas funcionan.

**Pasos**:
1. Crea un usuario sin suscripción
2. Intenta acceder a una ruta protegida con `requireSubscription()`

**Verificaciones**:
- [ ] Redirige a `/pricing`
- [ ] Con suscripción activa, permite acceso

**Código de ejemplo**:
```typescript
// En cualquier página protegida
import { requireSubscription } from '@/shared/auth';

export default async function PremiumPage({ params }) {
  const { locale } = await params;
  await requireSubscription(locale);

  return <div>Contenido premium</div>;
}
```

## Tarjetas de Prueba

| Número | Comportamiento |
|--------|----------------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 3220` | Requiere autenticación 3D Secure |
| `4000 0000 0000 9995` | Pago rechazado (fondos insuficientes) |
| `4000 0000 0000 0341` | Tarjeta rechazada |
| `4000 0000 0000 0002` | Tarjeta rechazada (card_declined) |
| `4000 0027 6000 3184` | Requiere autenticación en cada pago |

**Para todas las tarjetas**:
- Fecha: cualquier fecha futura
- CVC: cualquier 3 dígitos
- ZIP: cualquier código postal

## Comandos Útiles de Stripe CLI

### Escuchar webhooks
```bash
# Básico
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Con eventos específicos
stripe listen --forward-to localhost:3000/api/webhooks/stripe --events checkout.session.completed,customer.subscription.updated

# Ver solo los logs sin forwarding
stripe listen --print-json
```

### Simular eventos
```bash
# Checkout completado
stripe trigger checkout.session.completed

# Suscripción actualizada
stripe trigger customer.subscription.updated

# Suscripción eliminada
stripe trigger customer.subscription.deleted

# Pago fallido
stripe trigger invoice.payment_failed

# Pago exitoso
stripe trigger invoice.payment_succeeded

# Ver todos los eventos disponibles
stripe trigger --help
```

### Ver logs de eventos
```bash
# Últimos eventos
stripe events list --limit 10

# Detalles de un evento
stripe events retrieve evt_xxxxx
```

### Gestionar productos y precios
```bash
# Listar productos
stripe products list

# Listar precios
stripe prices list

# Crear producto de prueba
stripe products create --name="Test Product"

# Crear precio de prueba
stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month
```

## Debugging

### Ver logs del webhook

En la Terminal 2 (stripe listen), verás:
```
2024-01-15 10:30:45   --> checkout.session.completed [evt_xxx]
2024-01-15 10:30:45  <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

- `-->` = evento recibido de Stripe
- `<--` = respuesta de tu servidor

### Errores comunes

**Error 400 - Invalid signature**:
- El `STRIPE_WEBHOOK_SECRET` no coincide
- Copia el secret que muestra `stripe listen` a tu `.env.local`
- Reinicia el servidor

**Error 500 - Webhook handler failed**:
- Revisa los logs de Next.js en Terminal 1
- Probablemente error de base de datos o código

**No llegan eventos**:
- Verifica que `stripe listen` está corriendo
- Verifica la URL: `localhost:3000/api/webhooks/stripe`

### Verificar base de datos

```sql
-- Ver customers
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;

-- Ver subscriptions
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;

-- Ver subscription de un usuario específico
SELECT * FROM subscriptions WHERE user_id = 'uuid-del-usuario';

-- Ver estado actual
SELECT
  u.email,
  s.status,
  s.stripe_price_id,
  s.current_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status IN ('active', 'trialing');
```

## Checklist Final

Antes de desplegar a producción, verifica:

- [ ] Checkout completo funciona
- [ ] Webhooks procesan correctamente
- [ ] Cancelación actualiza status
- [ ] Pago fallido marca como past_due
- [ ] Control de acceso funciona
- [ ] Customer Portal funciona
- [ ] Base de datos se sincroniza correctamente

## Recursos

- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/cli)
- [Webhook Events](https://stripe.com/docs/webhooks/stripe-events)
- [Test Clocks](https://stripe.com/docs/billing/testing/test-clocks) - Para simular el paso del tiempo
