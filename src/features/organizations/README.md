# Organizations Feature

Gestión de equipos/workspaces para soporte B2B.

## Estructura

```
organizations/
├── types/
│   └── index.ts              # Tipos TypeScript
├── organizations.query.ts    # Database queries
└── index.ts                  # Barrel exports
```

## Conceptos

### Organización Personal
- Se crea automáticamente al registrar usuario
- No se puede eliminar
- `is_personal = true`
- El usuario es `owner`

### Roles

| Rol | Permisos |
|-----|----------|
| owner | Control total, gestión de billing |
| admin | Gestionar miembros |
| member | Uso de la app |

## Uso

### Obtener organizaciones del usuario

```typescript
import { getUserOrganizations } from '@/features/organizations';

const { organizations, error } = await getUserOrganizations(userId);

// organizations incluye el rol del usuario en cada org
organizations.forEach(org => {
  console.log(org.name, org.role); // 'My Org', 'owner'
});
```

### Obtener organización actual

```typescript
import { getCurrentOrganization } from '@/features/organizations';

const { organization, error } = await getCurrentOrganization(userId);

if (organization) {
  console.log(organization.name, organization.role);
}
```

## Base de Datos

### Tabla: organizations

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| name | text | Nombre del equipo |
| slug | text | URL-friendly name |
| is_personal | boolean | Org personal del usuario |
| created_by | uuid | Usuario que la creó |

### Tabla: organization_members

| Campo | Tipo | Descripción |
|-------|------|-------------|
| organization_id | uuid | FK a organizations |
| user_id | uuid | FK a auth.users |
| role | text | 'owner', 'admin', 'member' |
| joined_at | timestamptz | Fecha de unión |

### RLS Policies

- Members can view their organizations
- Owners can update their organizations
- Users can create organizations
- Owners can delete non-personal organizations
- Members can view org members
- Admins can manage members

### Helper Function

```sql
-- Retorna IDs de organizaciones del usuario actual
SELECT user_organizations();
```

Usada en policies RLS para queries eficientes.

## Suscripciones

Las suscripciones están vinculadas a `organization_id`, no a `user_id`.

```typescript
// Obtener suscripción de la org actual
const { data } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('organization_id', currentOrg.id)
  .single();
```

## Flujo de Onboarding

1. Usuario se registra
2. Trigger crea perfil
3. Trigger crea organización personal
4. Usuario es añadido como owner
5. `current_organization_id` se establece

## Futuras Extensiones

### Invitaciones (no implementado)
```sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations,
  email text,
  role text,
  token text,
  expires_at timestamptz,
  accepted_at timestamptz
);
```

### Switcher de Organizaciones (no implementado)
- UI para cambiar entre orgs
- Actualiza `profiles.current_organization_id`
- Recarga datos de la org activa
