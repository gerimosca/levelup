-- =============================================
-- Crisp Customer Support Integration
-- =============================================
-- Adds support for Crisp chat configuration in app_settings

-- First, we need to drop the existing constraint
ALTER TABLE app_settings
DROP CONSTRAINT IF EXISTS app_settings_category_check;

-- Add the new constraint with 'support' category included
ALTER TABLE app_settings
ADD CONSTRAINT app_settings_category_check
CHECK (category IN ('info_bar', 'email', 'features', 'cross_sell', 'general', 'support'));

-- =============================================
-- Default Crisp Settings
-- =============================================

-- Insert default Crisp settings (disabled by default)
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'crisp_settings',
  '{
    "enabled": false,
    "scope": "all",
    "hideOnMobile": false,
    "position": "right",
    "locale": "auto"
  }'::jsonb,
  'support',
  'Crisp customer support chat configuration'
) ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE app_settings IS 'Global application settings managed from admin panel including customer support configuration';

-- Add comment about the new support category
DO $$
BEGIN
  -- This is just for documentation purposes
  -- The support category is used for customer support tools like Crisp
  NULL;
END$$;