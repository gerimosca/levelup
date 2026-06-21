-- =============================================
-- Add subscribers_only scope to Crisp settings
-- =============================================
-- This migration documents the new subscribers_only scope option for Crisp chat
-- The actual validation happens at the application level via Zod schemas

-- Update the comment on app_settings to document the new scope option
COMMENT ON TABLE app_settings IS 'Global application settings managed from admin panel. For crisp_settings, scope can now include: all, authenticated, unauthenticated, subscribers_only';

-- Optionally update the default Crisp settings if you want to change the default
-- This is not required as the existing settings will continue to work
-- UPDATE app_settings
-- SET value = jsonb_set(value, '{scope}', '"subscribers_only"')
-- WHERE key = 'crisp_settings';

-- Note: No CHECK constraint update needed as we use JSONB and validate with Zod at the app level