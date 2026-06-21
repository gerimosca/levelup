-- Add price_amount column to subscriptions table for MRR calculation
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS price_amount INTEGER,
ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'USD';

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.price_amount IS 'Price amount in cents (e.g., 2999 for $29.99)';
COMMENT ON COLUMN subscriptions.price_currency IS 'ISO 4217 currency code (e.g., USD, EUR)';