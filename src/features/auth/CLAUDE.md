# Feature: Auth

## Propósito
Gestiona la autenticación de usuarios incluyendo registro, login con email/password, magic link, y OAuth (Google, GitHub, Apple, Facebook). Integra con Supabase Auth con una capa de abstracción para facilitar migración futura.

## Decisiones de Arquitectura
- **Supabase Auth como base**: Aprovechamos la infraestructura de auth de Supabase en lugar de implementar desde cero
- **Capa de abstracción**: `@/shared/auth` expone API agnóstica al provider para facilitar migración futura
- **OAuth configurable**: Los providers se configuran via `NEXT_PUBLIC_OAUTH_PROVIDERS` env var
- **Magic link como alternativa**: Ofrece passwordless login para mejor UX
- **Perfil auto-creado**: Trigger en BD crea profile automáticamente al registrar usuario
- **Server-first**: Auth state se obtiene en server y se pasa via context

## Arquitectura

### Estructura
```
src/
├── shared/
│   └── auth/
│       ├── index.ts          # Public API - all imports go through here
│       ├── types.ts          # AuthUser interface (nuestra, no de Supabase)
│       ├── session.ts        # getUser(), requireUser()
│       └── subscription.ts   # Subscription guards
└── features/
    └── auth/
        ├── auth.command.ts   # Supabase auth operations
        ├── auth.handler.ts   # Business logic
        ├── auth.actions.ts   # Server actions for forms
        ├── types/            # Zod schemas
        └── components/       # Login, Register, OAuth forms
```

### Principios de Diseño
1. **Single Point of Contact**: Todos los imports de auth desde `@/shared/auth`
2. **Provider Agnostic**: `AuthUser` type es nuestro, no de Supabase
3. **Server-First**: Auth state en server, pasado via context
4. **No Direct Imports**: Features nunca importan `@supabase/ssr` para auth

## Dependencias
- **Tables**: profiles (auto-creada via trigger en auth.users)
- **APIs externas**: Supabase Auth, OAuth providers configurados

## API Reference

### Public Exports (`@/shared/auth`)
```typescript
// Session management
getUser(): Promise<AuthUser | null>
requireUser(locale?: string): Promise<AuthUser>

// Subscription guards
hasActiveSubscription(userId: string): Promise<boolean>
requireSubscription(userId: string, locale?: string): Promise<void>
requireUserWithSubscription(locale?: string): Promise<AuthUser>

// Types
type AuthUser = {
  id: string
  email: string
  emailVerified?: boolean
  avatar?: string
  name?: string
}
```

### Server Actions (`@/features/auth`)
```typescript
loginAction(prevState, formData): Promise<AuthState>
registerAction(prevState, formData): Promise<AuthState>
magicLinkAction(prevState, formData): Promise<AuthState>
logoutAction(): Promise<void>
oauthAction(provider: OAuthProvider): Promise<void>
```

## OAuth Configuration

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OAUTH_PROVIDERS=google,apple  # comma-separated, empty = email only
```

### Supported Providers
- Google (console.cloud.google.com)
- Apple (developer.apple.com)
- Facebook (developers.facebook.com)
- GitHub (github.com/settings/developers)

### Setup
1. Enable provider in Supabase Dashboard → Authentication → Providers
2. Add Client ID and Secret from provider console
3. Set redirect URL: `{NEXT_PUBLIC_APP_URL}/auth/callback`

## Testing

### Test Files
- `src/features/auth/__tests__/auth.handler.test.ts` - Handler unit tests
- `tests/e2e/auth.spec.ts` - E2E auth flows

### Casos críticos (Unit Tests)
- [x] Login con credenciales válidas retorna success
- [x] Login con email inválido retorna error de validación
- [x] Login con credenciales incorrectas retorna error
- [x] Register con datos válidos retorna success
- [x] Register con passwords diferentes retorna error
- [x] Register con email existente retorna EMAIL_EXISTS
- [x] Magic link con email válido retorna success
- [x] Logout retorna success

### Casos críticos (E2E Tests)
- [x] Página de login muestra formulario
- [x] Login exitoso redirige a dashboard
- [x] Usuario autenticado no puede acceder a /login
- [x] Rutas protegidas redirigen a login
- [x] Sesión persiste después de reload
- [x] Logout redirige a login

### Ejecutar tests
```bash
# Unit tests
npm run test -- auth.handler

# E2E tests
npm run test:e2e -- auth.spec
```

### Mocking en tests
```typescript
// Mock auth commands
const mockSignInWithPassword = vi.fn();
vi.mock('../auth.command', () => ({
  signInWithPassword: (...args) => mockSignInWithPassword(...args),
}));

// Set response
mockSignInWithPassword.mockResolvedValue({
  user: { id: 'user_123', email: 'test@example.com' },
  error: null,
});
```

## Deuda Técnica
- [ ] Implementar refresh token rotation
- [ ] Añadir rate limiting en intentos de login
- [ ] Mejorar mensajes de error para ser más específicos

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check email/password
   - Verify user exists in Supabase dashboard

2. **OAuth redirect fails**
   - Verify `NEXT_PUBLIC_APP_URL` matches OAuth app config
   - Check callback route exists at `/auth/callback`

3. **Session not persisting**
   - Check middleware is running
   - Verify cookies are being set

4. **User is null after login**
   - Ensure `updateSession()` is called in middleware
   - Check for cookie domain mismatches

## Migration Guide (Auth.js)

Para migrar a Auth.js en el futuro:

1. Update `src/shared/auth/session.ts` - Replace Supabase calls with Auth.js `auth()`
2. Update `src/features/auth/auth.command.ts` - Replace with Auth.js signIn/signOut
3. Update middleware - Replace `updateSession()` with Auth.js middleware
4. Update callback route - Replace `/auth/callback` with Auth.js API route
5. Database - Add Auth.js adapter tables

Estimated: 4-6 hours, ~5-6 files

## Security Notes
- All auth operations happen server-side
- Tokens stored in HTTP-only cookies
- CSRF protection via Supabase
- Rate limiting on auth endpoints (Supabase)
- Email verification required for registration

## Notas
- Los componentes de OAuth (`oauth-buttons.tsx`) se renderizan condicionalmente según `NEXT_PUBLIC_OAUTH_PROVIDERS`
- Los errores de auth están tipados en `types/errors.ts`
- La sesión se maneja en `@/shared/auth/session.ts`
- Empty `NEXT_PUBLIC_OAUTH_PROVIDERS` = email-only authentication
