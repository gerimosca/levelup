-- Add affiliate calculator configuration fields
-- These settings control the simplified calculator on the affiliate landing page

-- Note: The affiliate_program settings are stored as JSONB in app_settings table
-- This migration doesn't create new columns but documents the expected structure
-- The new fields (average_sale_price, calculator_enabled) are added to the existing
-- affiliate_program JSONB value when saved from the admin panel

-- Example of the expected JSONB structure for affiliate_program setting:
-- {
--   "enabled": true,
--   "display_in_header": false,
--   "display_in_footer": true,
--   "display_in_home": false,
--   "rewardful_form_url": "https://yourapp.getrewardful.com/signup",
--   "commission_rate": "30%",
--   "webhook_endpoint": "/api/webhooks/rewardful",
--   "average_sale_price": 297,        -- NEW: Average sale price in euros
--   "calculator_enabled": true         -- NEW: Show/hide calculator on affiliate page
-- }

-- Insert default affiliate_program settings if not exists
INSERT INTO app_settings (key, value, category, description)
VALUES (
  'affiliate_program',
  '{
    "enabled": false,
    "display_in_header": false,
    "display_in_footer": true,
    "display_in_home": false,
    "rewardful_form_url": "",
    "commission_rate": "30%",
    "webhook_endpoint": "/api/webhooks/rewardful",
    "average_sale_price": 297,
    "calculator_enabled": true
  }'::jsonb,
  'features',
  'Affiliate program configuration including Rewardful integration and calculator settings'
)
ON CONFLICT (key) DO NOTHING;

-- Update existing affiliate_program settings to include new fields if missing
UPDATE app_settings
SET value = jsonb_set(
  jsonb_set(
    value,
    '{average_sale_price}',
    COALESCE(value->'average_sale_price', '297'::jsonb)
  ),
  '{calculator_enabled}',
  COALESCE(value->'calculator_enabled', 'true'::jsonb)
)
WHERE key = 'affiliate_program'
  AND (
    value->'average_sale_price' IS NULL
    OR value->'calculator_enabled' IS NULL
  );