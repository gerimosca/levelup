-- Migration: Organizations (B2B-ready)
-- Description: Creates organizations and members tables for team support

-- Tabla organizations (equipos/workspaces)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  is_personal BOOLEAN DEFAULT false, -- org personal no se puede borrar
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla organization_members (membresías)
CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- Añadir FK de current_organization_id en profiles
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_current_org
  FOREIGN KEY (current_organization_id)
  REFERENCES organizations(id)
  ON DELETE SET NULL;

-- Índices
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener organizaciones del usuario actual
CREATE OR REPLACE FUNCTION user_organizations()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas RLS para organizations
CREATE POLICY "Members can view their organizations" ON organizations
  FOR SELECT USING (id IN (SELECT user_organizations()));

CREATE POLICY "Owners can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can delete non-personal organizations" ON organizations
  FOR DELETE USING (
    is_personal = false AND
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas RLS para organization_members
CREATE POLICY "Members can view org members" ON organization_members
  FOR SELECT USING (organization_id IN (SELECT user_organizations()));

CREATE POLICY "Admins can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Service role tiene acceso completo
CREATE POLICY "Service role full access organizations" ON organizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access org_members" ON organization_members
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at en organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear organización personal al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Crear organización personal
  INSERT INTO public.organizations (name, slug, is_personal, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.id::TEXT, -- usar user_id como slug para garantizar unicidad
    true,
    NEW.id
  )
  RETURNING id INTO org_id;

  -- Añadir usuario como owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');

  -- Establecer como organización actual
  UPDATE public.profiles
  SET current_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de crear el perfil
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_organization();

-- Comentarios
COMMENT ON TABLE organizations IS 'Teams/workspaces that group users and own subscriptions';
COMMENT ON TABLE organization_members IS 'Membership relation between users and organizations';
COMMENT ON COLUMN organizations.is_personal IS 'Personal org created at signup, cannot be deleted';
COMMENT ON COLUMN organization_members.role IS 'User role: owner (full control), admin (manage members), member (read/use)';
COMMENT ON FUNCTION user_organizations() IS 'Returns organization IDs for current user, used in RLS policies';
