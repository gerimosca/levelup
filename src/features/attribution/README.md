# Attribution & Tracking System

Sistema unificado de atribución de marketing y tracking de conversiones para Google Ads y Meta (Facebook/Instagram).

## Arquitectura

```
src/shared/attribution/
├── types.ts      # Tipos de datos
├── config.ts     # Configuración de plataformas
├── capture.ts    # Captura de UTMs, click IDs
├── storage.ts    # Persistencia en sessionStorage
├── client.ts     # Tracking client-side (gtag, fbq)
├── server.ts     # Tracking server-side (APIs)
└── index.ts      # Barrel export
```

## Configuración

### Variables de Entorno

```bash
# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX      # ID de cuenta (público)
GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXX         # Label de conversión (servidor)
GOOGLE_ADS_API_TOKEN=                        # Token para API (servidor)

# Meta/Facebook
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX   # ID del Pixel (público)
META_CONVERSIONS_ACCESS_TOKEN=               # Token para Conversions API (servidor)
```

### Scripts en Layout

Añadir en `src/app/[locale]/layout.tsx`:

```tsx
import Script from 'next/script';

// En el componente:
<>
  {/* Google Ads */}
  {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  )}

  {/* Meta Pixel */}
  {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  )}
</>
```

## Uso

### Captura de Attribution

```tsx
// En un componente o página
import { captureAndPersist, getCurrentAttribution } from '@/shared/attribution';

// Capturar al cargar la página
useEffect(() => {
  captureAndPersist();
}, []);

// Obtener attribution actual
const attribution = getCurrentAttribution();
```

### Tracking Client-side

```tsx
import { trackSignup, trackPurchase, trackViewPricing } from '@/shared/attribution';

// Registro
const { eventId, attribution } = await trackSignup(email, userId);

// Compra
await trackPurchase(99.00, 'USD', email, userId);

// Ver pricing
await trackViewPricing();
```

### Tracking Server-side

```tsx
// En una Server Action o API route
import { trackServerPurchase, trackServerSignup } from '@/shared/attribution';

// Después de una compra exitosa (ej: webhook de Stripe)
await trackServerPurchase(
  eventId,           // Mismo ID que client-side para deduplicación
  attributionData,   // Datos de session.metadata
  99.00,             // Valor
  'USD',
  'user@email.com',
  userId
);
```

### Integración con Auth

```tsx
// En auth.handler.ts
import { trackServerSignup } from '@/shared/attribution';

export async function handleRegister(input, attributionData) {
  // ... crear usuario ...

  // Tracking server-side
  await trackServerSignup(
    crypto.randomUUID(),
    attributionData,
    input.email,
    user.id
  );

  return { success: true };
}
```

### Integración con Stripe

```tsx
// En el webhook de Stripe
case 'checkout.session.completed': {
  const session = event.data.object;
  const attribution = JSON.parse(session.metadata?.attribution_data || '{}');

  // Guardar en subscription
  await upsertSubscription({
    ...subscriptionData,
    attribution_data: attribution
  });

  // Enviar a APIs
  await trackServerPurchase(
    session.metadata?.event_id || crypto.randomUUID(),
    attribution,
    session.amount_total / 100,
    session.currency.toUpperCase(),
    session.customer_email,
    session.client_reference_id
  );
}
```

## Datos Capturados

### Attribution Data

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `via` | Código de afiliado | `partner123` |
| `utm_source` | Fuente de tráfico | `google`, `facebook` |
| `utm_medium` | Medio | `cpc`, `email`, `social` |
| `utm_campaign` | Campaña | `black_friday_2024` |
| `gclid` | Google Click ID | `EAIaIQo...` |
| `fbclid` | Facebook Click ID | `IwAR3...` |
| `fbc` | FB Click (formato) | `fb.1.1234567890.IwAR3...` |
| `fbp` | FB Browser ID | `fb.1.1234567890.987654321` |

### Eventos Estándar

| Evento | Google | Meta | Cuándo |
|--------|--------|------|--------|
| `signup` | `sign_up` | `CompleteRegistration` | Registro exitoso |
| `purchase` | `purchase` | `Purchase` | Pago completado |
| `view_pricing` | `view_item` | `ViewContent` | Ver página de pricing |
| `initiate_checkout` | `begin_checkout` | `InitiateCheckout` | Iniciar checkout |

## Queries SQL de Ejemplo

### Usuarios por fuente

```sql
SELECT
  attribution_data->>'utm_source' as source,
  COUNT(*) as users
FROM profiles
WHERE attribution_data->>'utm_source' IS NOT NULL
GROUP BY source
ORDER BY users DESC;
```

### Conversiones por campaña

```sql
SELECT
  attribution_data->>'utm_campaign' as campaign,
  COUNT(*) as conversions,
  SUM((attribution_data->>'value')::numeric) as revenue
FROM subscriptions
WHERE status = 'active'
GROUP BY campaign
ORDER BY revenue DESC;
```

### Comparar registro vs conversión

```sql
SELECT
  p.attribution_data->>'utm_source' as signup_source,
  s.attribution_data->>'utm_source' as purchase_source,
  COUNT(*) as conversions
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
GROUP BY signup_source, purchase_source
ORDER BY conversions DESC;
```

## Deduplicación

El sistema usa `event_id` para evitar duplicados:

1. **Client-side** genera un `event_id` único
2. Lo envía a Google/Meta Pixel
3. Lo pasa al servidor (ej: en metadata de Stripe)
4. **Server-side** envía el mismo `event_id` a las APIs

Las plataformas deduplicarán automáticamente eventos con el mismo ID.

## Extender a Otras Plataformas

Para añadir TikTok, LinkedIn, etc:

1. Agregar config en `config.ts`
2. Agregar función de envío en `client.ts` y `server.ts`
3. Actualizar `trackEvent()` para incluir la nueva plataforma
