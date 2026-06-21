# Feature: My Account

## Propósito
Permite al usuario gestionar su perfil y preferencias: nombre completo, idioma preferido (en/es), zona horaria, y tema (light/dark/system).

## Decisiones de Arquitectura
- **Upsert en profiles**: Usamos upsert para manejar el caso donde el profile no existe (aunque debería crearse via trigger)
- **Idiomas limitados**: Solo soportamos 'en' y 'es' por ahora, validado con Zod enum
- **Preferencias en profiles**: Las preferencias de usuario (idioma, timezone) se guardan en la tabla profiles
- **Tema via next-themes**: La preferencia de tema se maneja con next-themes, no se guarda en BD

## Dependencias
- **Tables**: profiles
- **APIs externas**: Ninguna

## Base de Datos

### Tabla: profiles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK, igual a auth.users.id |
| full_name | text | Nombre del usuario |
| avatar_url | text | URL del avatar |
| language | text | 'en' o 'es' |
| timezone | text | Ej: 'America/New_York' |
| user_flags | text[] | ['alpha', 'beta', etc] |
| current_organization_id | uuid | Org activa |

### RLS Policies
- Users can view own profile
- Users can update own profile
- Service role full access

## Testing

### Casos críticos
- [ ] Usuario puede ver su perfil actual
- [ ] Usuario puede actualizar nombre
- [ ] Usuario puede cambiar idioma (y la app cambia)
- [ ] Usuario puede cambiar timezone
- [ ] Validaciones funcionan (nombre no vacío, idioma válido)
- [ ] Feedback correcto después de guardar
- [ ] Theme toggle funciona (light/dark/system)
- [ ] Theme persiste en reload

### Test Cases Detallados

#### Profile Form
- **TC-001**: Load profile data - Form shows current profile data for authenticated user
- **TC-002**: Update profile successfully - Success message appears, data persists on reload
- **TC-003**: Validation error - Error message appears, form not submitted
- **TC-004**: Profile not found (new user) - Form shows with default values

#### Theme Selection
- **TC-005**: Toggle to dark mode - UI switches immediately
- **TC-006**: Toggle to light mode - UI switches immediately
- **TC-007**: System theme preference - Follows system setting
- **TC-008**: Theme persists on reload

#### Edge Cases
- **TC-009**: Concurrent updates - Last save wins, no errors
- **TC-010**: Session expired - Error "Not authenticated" shown

#### Mobile
- **TC-011**: Form on mobile - Properly sized, inputs tappable
- **TC-012**: Theme buttons on mobile - Properly spaced and tappable

### Ejecutar tests
```bash
npm run test -- features/my-account
```

### Manual Testing Checklist
- [ ] Profile loads correctly for existing user
- [ ] Profile shows defaults for new user
- [ ] Name update persists
- [ ] Language change works
- [ ] Timezone update works
- [ ] Dark mode toggle works
- [ ] Light mode toggle works
- [ ] System mode toggle works
- [ ] Theme persists on reload
- [ ] Success message shows on save
- [ ] Error message shows on failure
- [ ] Form works on mobile
- [ ] Form works on tablet

## Deuda Técnica
- [ ] Añadir upload de avatar
- [ ] Implementar cambio de email
- [ ] Añadir cambio de password
- [ ] Implementar delete account

## Notas
- El perfil se crea automáticamente al registrarse (trigger en BD)
- `user_flags` permite marcar usuarios como alpha/beta testers
- `current_organization_id` define la organización activa para usuarios multi-org
- El idioma seleccionado debe sincronizarse con next-intl
- El timezone se usa para mostrar fechas en la zona del usuario
