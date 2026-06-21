# Consent Feature

## Descripción

Sistema de gestión de consentimiento de cookies GDPR-compliant con Google Consent Mode v2.

## Estructura

```
consent/
├── types/index.ts        # Zod schemas y tipos TS
├── consent.config.ts     # Configuración (master switch, URLs, categorías)
├── components/
│   ├── consent-provider.tsx  # Context provider
│   ├── consent-banner.tsx    # Banner de consentimiento
│   ├── consent-modal.tsx     # Modal de preferencias
│   └── consent-gate.tsx      # Renderizado condicional
├── hooks/
│   └── use-consent.ts    # Hook para consumir el contexto
└── lib/
    ├── storage.ts        # Persistencia localStorage/sessionStorage
    └── gtag.ts           # Google Consent Mode helpers
```

## Categorías de Consentimiento

| Categoría | Requerida | Incluye |
|-----------|-----------|---------|
| `necessary` | Sí | Auth, sesión, UTMs, landing page, referrer, device type |
| `marketing` | No | gclid, fbclid, Meta Pixel, Google Ads identifiers |

## Uso Básico

### Verificar consentimiento

```tsx
import { useConsent } from '@/features/consent/hooks/use-consent';

function MyComponent() {
  const { consent, isEnabled } = useConsent();

  if (consent.marketing) {
    // Usuario aceptó marketing
  }
}
```

### Renderizado condicional

```tsx
import { ConsentGate } from '@/features/consent/components';

<ConsentGate category="marketing">
  <TrackingScript />
</ConsentGate>
```

### Abrir preferencias

```tsx
const { openPreferences } = useConsent();

<button onClick={openPreferences}>Gestionar cookies</button>
```

## Configuración

### Habilitar/Deshabilitar

```bash
# .env
NEXT_PUBLIC_CONSENT_ENABLED=true  # o false para deshabilitar
```

### Cambiar versión (re-pedir consentimiento)

```typescript
// consent.config.ts
version: '1.1', // Incrementar para invalidar consents anteriores
```

### Cambiar URLs de políticas (para Iubenda)

```typescript
// consent.config.ts
policyUrls: {
  privacy: 'https://www.iubenda.com/privacy-policy/xxxxx',
  cookies: 'https://www.iubenda.com/privacy-policy/xxxxx/cookie-policy',
  terms: '/terms',
},
```

## Lógica de Expiración

| Acción | Persistencia | Duración |
|--------|--------------|----------|
| Acepta (marketing=true) | localStorage | 365 días |
| Rechaza (marketing=false) | sessionStorage | Solo sesión |

## Integración con Attribution

### Captura de datos

```typescript
import { captureAttribution } from '@/shared/attribution/capture';

// Siempre captura UTMs, landing, referrer
const basicData = captureAttribution({ includeClickIds: false });

// Solo con consent marketing
const fullData = captureAttribution({ includeClickIds: true });
```

### Server-side tracking

```typescript
import { trackServerSignup } from '@/shared/attribution/server';

// Pasar hasMarketingConsent para Meta API
await trackServerSignup(
  eventId,
  attribution,
  email,
  userId,
  hasMarketingConsent // true para enviar a Meta
);
```

## Google Consent Mode v2

### Señales enviadas

| Señal | Valor con consent | Valor sin consent |
|-------|-------------------|-------------------|
| `analytics_storage` | `granted` | `granted` (UTMs son necesarios) |
| `ad_storage` | `granted` | `denied` |
| `ad_user_data` | `granted` | `denied` |
| `ad_personalization` | `granted` | `denied` |

### Comportamiento

- **Sin consent**: Google recibe eventos pero sin identifiers → hace conversion modeling (~70-80% precisión)
- **Con consent**: Google recibe gclid → atribución exacta

## Integración con Iubenda (Futuro)

Para integrar con Iubenda:

1. Cambiar `policyUrls` en `consent.config.ts`
2. Opcional: Reemplazar `consent-banner.tsx` con widget de Iubenda
3. El resto del sistema (Consent Mode, attribution) sigue funcionando

## Archivos Relacionados

- `src/app/[locale]/layout.tsx` - ConsentProvider y scripts
- `src/shared/attribution/capture.ts` - Captura con consentimiento
- `src/shared/attribution/server.ts` - Server-side con consentimiento
- `src/shared/components/layouts/marketing-layout.tsx` - Link footer
- `src/shared/components/layouts/app-layout.tsx` - Link footer
- `messages/en.json` → `consent`
- `messages/es.json` → `consent`

## Decisiones de Arquitectura

### ¿Por qué UTMs son "necesarios"?

Los UTMs se usan para personalización de experiencia (mostrar ofertas de partners, adaptar onboarding), no solo para marketing. Esto los clasifica como "legitimate interest" bajo GDPR.

### ¿Por qué sessionStorage para rechazos?

- Respeta la decisión del usuario durante la sesión
- Permite re-preguntar en próximas visitas (oportunidad de conversión)
- Balance entre UX y compliance

### ¿Por qué Google siempre recibe eventos?

Google Consent Mode permite enviar eventos sin identifiers. Google hace conversion modeling internamente, dando ~70-80% de precisión. Esto mantiene funcionalidad de ads sin violar privacidad.

## Testing

### Verificar Consent Mode

1. Abrir DevTools → Console
2. Escribir: `dataLayer`
3. Buscar `consent` → Debe mostrar defaults `denied`
4. Aceptar cookies → Buscar `consent` update con `granted`

### Verificar bloqueo de scripts

1. Rechazar cookies
2. Network → Filtrar por "facebook" o "fbevents"
3. No debe cargar Meta Pixel

## Deuda Técnica

- [ ] Añadir tabla `consent_records` para audit trail (opcional)
- [ ] Implementar data export para GDPR (en my-account)
- [ ] Implementar delete account para GDPR (en my-account)
- [ ] Crear páginas /privacy y /terms (o integrar Iubenda)

## Troubleshooting

### Banner no aparece

1. Verificar `NEXT_PUBLIC_CONSENT_ENABLED` está en `true` o no definido
2. Verificar que no hay consent guardado: `localStorage.clear()` + `sessionStorage.clear()`
3. Verificar versión en config vs versión guardada

### Meta Pixel carga sin consent

1. Verificar que `ConsentGate` envuelve el script correctamente
2. Verificar que el componente está dentro de `ConsentProvider`

### gtag no envía consent update

1. Verificar que `process.env.NEXT_PUBLIC_GOOGLE_ADS_ID` está definido
2. Verificar que gtag se carga antes del update (strategy="beforeInteractive")
