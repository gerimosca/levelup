-- Add display_in_home field to affiliate_program settings
UPDATE app_settings
SET value = jsonb_set(
    value,
    '{display_in_home}',
    'false'::jsonb
)
WHERE key = 'affiliate_program'
AND NOT (value ? 'display_in_home');

-- Update the description to reflect the new field
UPDATE app_settings
SET description = 'Affiliate program configuration including display options for header, footer, and home page'
WHERE key = 'affiliate_program';