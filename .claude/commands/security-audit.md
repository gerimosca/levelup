Realiza una auditoría de seguridad completa del proyecto.

## 1. Dependencias

### npm audit
```bash
npm audit
```
- [ ] No hay vulnerabilidades críticas o altas
- [ ] Documentar vulnerabilidades medias/bajas si existen

## 2. Row Level Security (RLS)

### Verificar migraciones
Revisar todos los archivos en `supabase/migrations/`:
- [ ] Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`
- [ ] Todas las tablas tienen políticas para usuarios autenticados
- [ ] Las políticas filtran por `auth.uid() = user_id`
- [ ] Service role tiene acceso solo donde es necesario (webhooks)

### Buscar tablas sin RLS
```bash
grep -L "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql
```

## 3. Autenticación en Server Actions

### Verificar todas las actions
En cada archivo `*.actions.ts`:
- [ ] Todas las actions llaman a `getUser()` al inicio
- [ ] Retornan error si `!user`
- [ ] No hay actions públicas que deberían ser protegidas

### Buscar actions sin auth
```bash
grep -L "getUser()" src/features/*/*.actions.ts
```

### Patrón correcto
```typescript
export async function myAction(...) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  // ...
}
```

## 4. Validación de Input

### Verificar handlers
En cada archivo `*.handler.ts`:
- [ ] Todos los handlers validan input con Zod schema
- [ ] No hay `as any` para bypass de tipos
- [ ] Errores de validación se retornan correctamente

### Buscar handlers sin validación
```bash
grep -L "safeParse" src/features/*/*.handler.ts
```

## 5. Secrets y API Keys

### Buscar secrets hardcodeados
```bash
grep -r "sk_live\|sk_test\|api_key\|apikey\|secret" src/ --include="*.ts" --include="*.tsx"
grep -r "password.*=.*['\"]" src/ --include="*.ts" --include="*.tsx"
```
- [ ] No hay API keys en código
- [ ] No hay passwords hardcodeados
- [ ] Todos los secrets vienen de `process.env`

### Verificar .gitignore
- [ ] `.env` está en .gitignore
- [ ] `.env.local` está en .gitignore
- [ ] No hay archivos .env commiteados

## 6. Variables de Entorno

### Client-side exposure
```bash
grep -r "process.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "NEXT_PUBLIC"
```
- [ ] Solo `NEXT_PUBLIC_*` se usan en código cliente
- [ ] Secrets de server no se exponen al cliente

### Server-only secrets
Verificar que estos NUNCA aparecen en componentes client:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 7. Stripe Webhook Security

### Verificar signature
En `src/app/api/webhooks/stripe/route.ts`:
- [ ] Se verifica `stripe-signature` header
- [ ] Se usa `stripe.webhooks.constructEvent()`
- [ ] Se maneja error de signature inválida

### Patrón correcto
```typescript
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## 8. SQL Injection

### Verificar queries
- [ ] No hay SQL raw con interpolación de strings
- [ ] Se usa el query builder de Supabase
- [ ] Parámetros se pasan como argumentos, no concatenados

### Buscar SQL peligroso
```bash
grep -r "\.rpc\|\.sql\|raw(" src/ --include="*.ts"
```

## 9. XSS Protection

### Verificar rendering
- [ ] No hay `dangerouslySetInnerHTML` sin sanitización
- [ ] Input de usuario se escapa correctamente
- [ ] URLs de usuario se validan antes de usar

### Buscar uso peligroso
```bash
grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx"
```

## 10. CSRF Protection

- [ ] Server Actions de Next.js tienen protección CSRF built-in
- [ ] No hay API routes POST sin verificación

## Reporte Final

### Formato
```
# Security Audit - [Fecha]

## Resumen
- Checks pasados: X/Y
- Vulnerabilidades críticas: X
- Vulnerabilidades altas: X
- Warnings: X

## Vulnerabilidades Críticas ❌
[Lista de issues que requieren fix inmediato]

## Vulnerabilidades Altas ⚠️
[Lista de issues importantes]

## Warnings 📋
[Lista de mejoras sugeridas]

## Checks Pasados ✅
[Lista resumida]

## Acciones Requeridas
1. [Acción prioritaria]
2. [Acción secundaria]
```

## Frecuencia Recomendada

- **Antes de deploy a producción**: Siempre
- **Después de añadir dependencias**: `npm audit`
- **Después de nueva feature**: Verificar RLS y auth
- **Mensualmente**: Auditoría completa
