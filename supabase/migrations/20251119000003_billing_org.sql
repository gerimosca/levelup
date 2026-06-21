-- Migration: Update billing tables for organization-based subscriptions
-- Description: Migrates customers and subscriptions from user_id to organization_id

-- Añadir columna organization_id a customers
ALTER TABLE customers
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Añadir columna organization_id a subscriptions
ALTER TABLE subscriptions
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Migrar datos existentes: asignar la org personal del usuario
-- (Solo relevante si ya hay datos en producción)
UPDATE customers c
SET organization_id = (
  SELECT om.organization_id
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = c.user_id
    AND o.is_personal = true
  LIMIT 1
)
WHERE organization_id IS NULL;

UPDATE subscriptions s
SET organization_id = (
  SELECT om.organization_id
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = s.user_id
    AND o.is_personal = true
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Crear índices para organization_id
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);

-- Añadir constraint UNIQUE para organization_id (manteniendo user_id para upsert)
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_key UNIQUE (organization_id);

-- Actualizar políticas RLS para soportar user_id Y organization_id
DROP POLICY IF EXISTS "Users can view own customer" ON customers;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (
    auth.uid() = user_id
    OR organization_id IN (SELECT user_organizations())
  );

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    auth.uid() = user_id
    OR organization_id IN (SELECT user_organizations())
  );

-- Comentarios actualizados
COMMENT ON COLUMN customers.organization_id IS 'Organization that owns this Stripe customer';
COMMENT ON COLUMN subscriptions.organization_id IS 'Organization that owns this subscription';

-- Nota: user_id se mantiene por compatibilidad pero organization_id es la referencia principal
-- En una migración futura se podría eliminar user_id de estas tablas
