-- Quick fix: Insert affiliate_program setting if missing
INSERT INTO app_settings (key, value, category, description)
VALUES (
  'affiliate_program',
  '{"enabled": false, "display_in_header": false, "display_in_footer": true, "display_in_home": false, "rewardful_form_url": "", "commission_rate": "30%", "webhook_endpoint": "/api/webhooks/rewardful", "average_sale_price": 297, "calculator_enabled": true}'::jsonb,
  'features',
  'Affiliate program configuration including Rewardful integration and calculator settings'
)
ON CONFLICT (key) DO UPDATE SET
  value = jsonb_set(
    jsonb_set(
      COALESCE(app_settings.value, '{}'::jsonb),
      '{average_sale_price}',
      COALESCE(app_settings.value->'average_sale_price', '297'::jsonb)
    ),
    '{calculator_enabled}',
    COALESCE(app_settings.value->'calculator_enabled', 'true'::jsonb)
  ),
  updated_at = now()
WHERE app_settings.key = 'affiliate_program';
