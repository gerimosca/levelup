# Feature: Billing

## Propósito
Gestiona suscripciones y pagos con Stripe. Usa Stripe Pricing Table para mostrar planes y webhooks para sincronizar estado de suscripciones.

## Decisiones de Arquitectura
- **Stripe Pricing Table**: Usamos el componente embebido de Stripe en lugar de UI custom para simplificar compliance y mantenimiento
- **Webhooks para sync**: El estado de suscripción se sincroniza via webhooks, no polling
- **Service role en webhooks**: Los webhooks usan service role key para bypass de RLS
- **Customer Portal**: Usamos el portal de Stripe para gestión de suscripción (cambiar plan, cancelar, actualizar pago)

## Dependencias
- **Tables**: customers, subscriptions
- **APIs externas**: Stripe API, Stripe Webhooks

## Testing

### Casos críticos
- [ ] Pricing table se renderiza correctamente
- [ ] Usuario puede iniciar checkout
- [ ] Webhook `checkout.session.completed` crea customer y subscription
- [ ] Webhook `customer.subscription.updated` actualiza estado
- [ ] Webhook `customer.subscription.deleted` marca como cancelada
- [ ] Usuario puede acceder a Customer Portal
- [ ] RLS permite a usuarios ver solo su suscripción

### Ejecutar tests
```bash
npm run test -- features/billing
# Para webhooks, usar Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deuda Técnica
- [ ] Añadir manejo de `invoice.payment_failed` para notificar usuario
- [ ] Implementar grace period para suscripciones past_due
- [ ] Añadir tracking de uso para planes metered

## Notas
- El webhook endpoint está en `/api/webhooks/stripe/route.ts`
- El pricing table ID viene de `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`
- El customer se crea en el primer checkout, no en registro
- Verificar signature del webhook con `STRIPE_WEBHOOK_SECRET`
- Los estados válidos de subscription están definidos como CHECK constraint en la migración
