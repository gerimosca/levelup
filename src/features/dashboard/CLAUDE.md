# Feature: Dashboard

## Propósito
Página principal de la aplicación después del login. Muestra estadísticas y resumen del estado del usuario.

## Decisiones de Arquitectura
- **Server Component**: El dashboard es un Server Component que fetch data directamente
- **Widgets modulares**: Cada sección de stats es un componente separado para facilitar mantenimiento

## Dependencias
- **Tables**: Depende de otras features (subscriptions para billing status, etc.)
- **APIs externas**: Ninguna directa

## Testing

### Casos críticos
- [ ] Dashboard carga para usuario autenticado
- [ ] Redirección a login si no autenticado
- [ ] Stats se muestran correctamente
- [ ] Manejo de errores si falla carga de datos

### Ejecutar tests
```bash
npm run test -- features/dashboard
```

## Deuda Técnica
- [ ] Implementar loading states con Suspense
- [ ] Añadir más widgets de estadísticas
- [ ] Considerar caching de stats frecuentes

## Notas
- Es la página por defecto después de login (`/dashboard`)
- Puede importar queries de otras features para mostrar datos agregados
- Mantener ligero - evitar queries pesadas
