# Feature: Organizations

## Propósito
Soporte para multi-tenancy donde usuarios pueden pertenecer a múltiples organizaciones y cambiar entre ellas. Incluye roles y permisos.

## Estado
🚧 **Work in Progress** - Esta feature está en desarrollo activo.

## Decisiones de Arquitectura
- **Multi-org por usuario**: Un usuario puede pertenecer a múltiples organizaciones
- **Organización actual en profile**: `current_organization_id` en profiles indica la org activa
- **Roles por membresía**: Cada membership tiene un rol (owner, admin, member)
- **Billing por organización**: Las suscripciones pueden ser a nivel de org (ver migration billing_org)

## Dependencias
- **Tables**: organizations, organization_members, (billing a nivel org en futuro)
- **APIs externas**: Ninguna

## Testing

### Casos críticos
- [ ] Usuario puede crear organización
- [ ] Usuario puede invitar miembros
- [ ] Usuario puede cambiar de organización activa
- [ ] Roles se respetan (owner puede todo, member limitado)
- [ ] RLS filtra datos por organización activa
- [ ] Usuario puede dejar organización
- [ ] Owner puede transferir ownership
- [ ] Último owner no puede dejar org

### Ejecutar tests
```bash
npm run test -- features/organizations
```

## Deuda Técnica
- [ ] Implementar sistema de invitaciones por email
- [ ] Añadir permisos granulares además de roles
- [ ] Implementar billing a nivel de organización
- [ ] UI para gestión de miembros
- [ ] Completar CRUD básico

## Notas
- Las migraciones están creadas pero la UI está incompleta
- Revisar `20251119000002_organizations.sql` para el schema
- El campo `current_organization_id` en profiles necesita actualizarse cuando el usuario cambia de org
- Considerar implicaciones de RLS cuando se implemente - las queries deben filtrar por org activa
- Esta feature cambiará significativamente la arquitectura de otras features (billing, etc.)
