# Admin Feature - Context Documentation

## Descripción

Panel de administración para el dueño del SaaS que permite:
- Configurar una barra de información global (info-bar) con diferentes modos y mensajes i18n
- Activar/desactivar journeys de emails con un click
- Ver estadísticas del negocio (usuarios, suscripciones, MRR)
- Gestionar usuarios y roles
- Cross-selling de productos adicionales

## Estructura de Archivos

```
/src/features/admin/
├── CLAUDE.md                          # Este archivo - contexto de la feature
├── types/index.ts                     # Zod schemas + TypeScript types
├── admin.query.ts                     # SELECT operations (stats, settings, users)
├── admin.command.ts                   # UPDATE operations (settings, user flags)
├── admin.handler.ts                   # Business logic + validation
├── admin.actions.ts                   # Server Actions (entry points)
└── components/
    ├── stats-dashboard.tsx            # Dashboard con métricas
    ├── info-bar-settings.tsx          # Configuración del info-bar
    ├── email-journeys-control.tsx     # Control de journeys de email
    └── cross-sell-panel.tsx           # Panel de cross-selling
```

## Decisiones de Arquitectura

### Sistema de Roles

**Decisión**: Usar `profiles.user_flags` (array existente) en lugar de crear tabla separada de roles.

**Razones**:
- Infraestructura ya existe
- Flexible para diferentes tipos de flags: `['admin', 'super_admin', 'beta', 'early_adopter']`
- Simple de consultar con RLS: `'admin' = ANY(user_flags)`
- No requiere JOINs adicionales

**Helpers creados** (`/src/shared/auth/roles.ts`):
- `hasRole(role)` - Verifica si usuario actual tiene el rol
- `isAdmin()` - Check si es admin o super_admin
- `isSuperAdmin()` - Check solo super_admin
- `requireAdmin(locale)` - Guard para rutas admin

### Tabla de Configuración

**Decisión**: Crear tabla `app_settings` con estructura key-value JSON.

**Razones**:
- Settings editables desde UI sin tocar código
- JSONB permite schemas flexibles por tipo de setting
- Un setting = un row (fácil de actualizar atómicamente)
- RLS permite control granular de acceso

**Schema**:
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT CHECK (category IN ('info_bar', 'email', 'features', 'cross_sell', 'general')),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ
);
```

**Políticas RLS**:
1. Admins pueden leer/escribir todo
2. Service role puede leer/escribir todo
3. Público puede leer `info_bar` (necesario para mostrar banner sin auth)

### Info-Bar Global

**Decisión**: Componente React Server que fetches settings y renderiza condicionalmente.

**Estructura del Setting**:
```json
{
  "enabled": true,
  "scope": "all" | "authenticated" | "unauthenticated",
  "mode": "info" | "warning" | "error",
  "messages": {
    "en": "...",
    "es": "..."
  },
  "dismissible": true
}
```

**Integración**:
- Se añade al layout principal (`/src/app/[locale]/layout.tsx`)
- Fetches on server (RSC) - no client state needed
- Dismiss persiste en localStorage (client component wrapper)

### Email Journeys

**Estructura**:
```json
{
  "welcome_series": {
    "enabled": true,
    "name": "Welcome Series",
    "description": "Onboarding emails for new users"
  },
  "trial_ending": { ... },
  ...
}
```

**Implementación**:
- UI muestra lista con Switches
- Cada toggle llama `toggleEmailJourneyAction(key, enabled)`
- Backend verifica el journey existe antes de togglear
- Services de email deben consultar este setting antes de enviar

### Cross-Selling

**Decisión**: Array de productos configurables en `app_settings`.

**Ventaja**:
- Admin puede añadir/modificar/remover productos sin deploy
- Soporte para badges ("Popular", "Enterprise")
- URLs internas o externas

## Casos de Uso

### 1. Activar Info-Bar de Mantenimiento

**Admin**:
1. Va a `/admin/settings`
2. Toggle "Enable Info Bar" ON
3. Selecciona scope: "all"
4. Modo: "warning"
5. Escribe mensajes en inglés/español
6. Save

**Usuario**:
- Ve banner amarillo en todas las páginas
- Puede dismissear si `dismissible: true`
- Dismiss persiste en localStorage

### 2. Desactivar Journey de Emails

**Admin**:
1. Va a `/admin/emails`
2. Ve lista de journeys con estado actual
3. Toggle OFF el journey "Monthly Digest"
4. Cambio es inmediato

**Sistema**:
- Service de emails consulta `getEmailJourneysSettings()`
- Si `monthly_digest.enabled === false`, no envía

### 3. Ver Estadísticas del Negocio

**Admin**:
1. Va a `/admin` (dashboard)
2. Ve cards con:
   - Total usuarios
   - Suscripciones activas
   - Usuarios en trial
   - MRR (Monthly Recurring Revenue)
   - Nuevos usuarios este mes

### 4. Hacer Usuario Admin

**Admin**:
1. Va a `/admin/users`
2. Busca al usuario
3. Click en "Make Admin"
4. Usuario ahora tiene `['admin']` en `user_flags`
5. Puede acceder a `/admin`

## Testing

### Manual Testing Checklist

**Info-Bar**:
- [ ] Activar info-bar con scope "all" → aparece en todas las páginas
- [ ] Cambiar a scope "authenticated" → solo usuarios con sesión lo ven
- [ ] Cambiar a scope "unauthenticated" → solo usuarios sin sesión lo ven
- [ ] Cambiar modo a "warning" → fondo amarillo
- [ ] Cambiar modo a "error" → fondo rojo
- [ ] Cambiar idioma → mensaje cambia correctamente
- [ ] Dismissear banner → no aparece en refresh (localStorage)
- [ ] Desactivar → no aparece en ninguna página

**Email Journeys**:
- [ ] Toggle journey OFF → switch visual cambia
- [ ] Refresh página → estado persiste
- [ ] Intentar toggle journey inexistente → error apropiado

**Roles**:
- [ ] Usuario sin rol → redirect a /dashboard al intentar acceder /admin
- [ ] Usuario con 'admin' flag → acceso completo a /admin
- [ ] Super admin → todas las funciones disponibles

**Stats**:
- [ ] Stats cargan correctamente
- [ ] Números reflejan datos reales de BD
- [ ] MRR se calcula correctamente

### Unit Tests (Pendiente)

**Handlers**:
```typescript
describe('handleUpdateInfoBarSettings', () => {
  it('valida input correctamente', async () => {
    const result = await handleUpdateInfoBarSettings('user-id', {
      enabled: 'invalid', // debería ser boolean
    });
    expect(result.success).toBe(false);
  });

  it('actualiza settings con input válido', async () => {
    const validInput = {
      enabled: true,
      scope: 'all',
      mode: 'info',
      messages: { en: 'Test', es: 'Prueba' },
      dismissible: true,
    };
    const result = await handleUpdateInfoBarSettings('user-id', validInput);
    expect(result.success).toBe(true);
  });
});
```

## Deuda Técnica

### Alta Prioridad

1. **Type Safety en app_settings.value**
   - **Problema**: `value JSONB` no tiene validación en BD
   - **Riesgo**: Corrupción de datos si se escribe JSON inválido
   - **Solución**: Añadir CHECK constraints con jsonb_typeof + keys requeridos

2. **Audit Log**
   - **Problema**: No hay log de cambios en settings
   - **Riesgo**: No se puede rastrear quién cambió qué
   - **Solución**: Crear tabla `admin_audit_log` con trigger en app_settings

3. **Regenerar Tipos después de Migración**
   - **Problema**: `npm run gen:types` falló por Docker no corriendo
   - **Solución**: Correr cuando Docker esté disponible o usar `--linked` para remote

### Media Prioridad

4. **Caché de Settings**
   - **Problema**: Cada request fetches settings de BD
   - **Optimización**: Redis cache con TTL de 5 min + invalidation on update

5. **Validación de URLs en Cross-Sell**
   - **Problema**: URLs no validadas, podrían ser maliciosas
   - **Solución**: Validar con Zod `.url()` en schema

6. **Email Journeys Real Integration**
   - **Problema**: Settings creados pero no conectados a sistema de emails real
   - **Solución**: Integrar con Resend/SendGrid cuando esté configurado

### Baja Prioridad

7. **Permisos Granulares**
   - **Mejora**: Diferentes niveles de admin (read-only, full access)
   - **Implementación**: Añadir flags como `['admin:read', 'admin:write', 'admin:users']`

8. **Batch Operations**
   - **Mejora**: Activar/desactivar múltiples journeys a la vez
   - **Implementación**: Nuevo action `bulkToggleEmailJourneys(keys[], enabled)`

9. **Settings History/Rollback**
   - **Mejora**: Ver historial de cambios y rollback a versión anterior
   - **Implementación**: Tabla `app_settings_history` + función restore

## Troubleshooting

### "Not authorized" al acceder /admin

**Causa**: Usuario no tiene flag 'admin' en `profiles.user_flags`.

**Solución**:
```sql
-- Hacer tu usuario admin manualmente
UPDATE profiles
SET user_flags = array_append(user_flags, 'admin')
WHERE id = 'tu-user-id';
```

### Info-bar no aparece después de activarlo

**Causa 1**: Caché de Next.js.
**Solución**: Hard refresh (Cmd+Shift+R) o `revalidatePath('/')` en action.

**Causa 2**: RLS bloqueando lectura pública de info_bar.
**Solución**: Verificar política "Public can read info_bar settings" existe.

### Stats muestran 0 usuarios

**Causa**: RLS impide query sin auth o con usuario no-admin.
**Solución**: Verificar que `requireAdmin()` se llama antes de `getAdminStats()`.

### TypeScript error "Property 'user_flags' does not exist"

**Causa**: Tipos no regenerados después de migración.
**Solución**: `npm run gen:types` cuando Docker esté corriendo.

## Próximos Pasos

1. **Crear componentes UI** para dashboard, settings, emails
2. **Crear rutas admin** en `/src/app/[locale]/(admin)/admin/`
3. **Añadir traducciones** completas en `/messages/{en,es}.json`
4. **Integrar info-bar** en layout principal
5. **Testing completo** de todos los flujos
6. **Documentar** en README principal cómo hacer primer usuario admin

## Referencias

- Migration: `/supabase/migrations/20251119000005_app_settings.sql`
- Auth Helpers: `/src/shared/auth/roles.ts`
- Patrón VSA: `/CLAUDE.md` - Vertical Slice Architecture
