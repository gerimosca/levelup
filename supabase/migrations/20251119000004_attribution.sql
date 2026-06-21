-- Migration: Attribution tracking
-- Description: Adds attribution_data JSONB to profiles, organizations, and subscriptions

-- Add attribution_data to profiles (user registration attribution)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS attribution_data JSONB DEFAULT '{}';

-- Add attribution_data to organizations (creator attribution for B2B analytics)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS attribution_data JSONB DEFAULT '{}';

-- Add attribution_data to subscriptions (conversion attribution)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS attribution_data JSONB DEFAULT '{}';

-- GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_profiles_attribution ON profiles USING GIN (attribution_data);
CREATE INDEX IF NOT EXISTS idx_organizations_attribution ON organizations USING GIN (attribution_data);
CREATE INDEX IF NOT EXISTS idx_subscriptions_attribution ON subscriptions USING GIN (attribution_data);

-- Specific indexes for common marketing queries
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON profiles ((attribution_data->>'utm_source'));
CREATE INDEX IF NOT EXISTS idx_subscriptions_utm_source ON subscriptions ((attribution_data->>'utm_source'));

-- Update handle_new_user() to save attribution data from user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, attribution_data)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->'attribution_data', '{}'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user_organization() to copy attribution from profile to org
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  user_attribution JSONB;
BEGIN
  -- Get attribution data from the profile
  SELECT attribution_data INTO user_attribution
  FROM public.profiles
  WHERE id = NEW.id;

  -- Create personal organization with attribution
  INSERT INTO public.organizations (name, slug, is_personal, created_by, attribution_data)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.id::TEXT,
    true,
    NEW.id,
    COALESCE(user_attribution, '{}'::jsonb)
  )
  RETURNING id INTO org_id;

  -- Add user as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');

  -- Set as current organization
  UPDATE public.profiles
  SET current_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON COLUMN profiles.attribution_data IS 'Marketing attribution at registration: utm_*, via, gclid, fbclid, fbc, fbp, referrer, landing_page';
COMMENT ON COLUMN organizations.attribution_data IS 'Attribution from organization creator for B2B analytics';
COMMENT ON COLUMN subscriptions.attribution_data IS 'Marketing attribution at conversion: utm_*, via, gclid, fbclid, fbc, fbp for API tracking';
