-- =================================================
-- Affiliate Program Settings
-- =================================================
-- Adds affiliate program configuration to app_settings table
-- Allows admins to enable/disable affiliate program and configure display options

-- Insert default affiliate program settings
INSERT INTO app_settings (key, value, category, description)
VALUES (
  'affiliate_program',
  jsonb_build_object(
    'enabled', false,
    'display_in_header', false,
    'display_in_footer', true,
    'rewardful_form_url', '',
    'commission_rate', '30%',
    'webhook_endpoint', '/api/webhooks/rewardful'
  ),
  'general',
  'Affiliate program configuration including Rewardful integration settings'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = now();

-- Optional: Create affiliate_referrals table for tracking (future enhancement)
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id TEXT NOT NULL UNIQUE,
  affiliate_id TEXT NOT NULL,
  affiliate_code TEXT, -- The 'via' parameter value
  customer_email TEXT NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'converted', 'cancelled', 'paid')),
  commission_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_customer_email ON affiliate_referrals(customer_email);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at DESC);

-- Enable RLS on affiliate_referrals
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view and manage all referrals
DROP POLICY IF EXISTS "Admins can manage affiliate referrals" ON affiliate_referrals;
CREATE POLICY "Admins can manage affiliate referrals"
  ON affiliate_referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.user_flags)
    )
  );

-- Policy: Service role has full access (for webhook)
DROP POLICY IF EXISTS "Service role has full access to affiliate referrals" ON affiliate_referrals;
CREATE POLICY "Service role has full access to affiliate referrals"
  ON affiliate_referrals FOR ALL
  TO service_role
  USING (true);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_affiliate_referrals_updated_at ON affiliate_referrals;
CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE affiliate_referrals IS 'Tracks affiliate referrals and commissions from Rewardful webhooks';
COMMENT ON COLUMN affiliate_referrals.referral_id IS 'Unique ID from Rewardful';
COMMENT ON COLUMN affiliate_referrals.affiliate_id IS 'Affiliate ID from Rewardful';
COMMENT ON COLUMN affiliate_referrals.affiliate_code IS 'The via parameter value used for tracking';
COMMENT ON COLUMN affiliate_referrals.customer_email IS 'Email of the referred customer';
COMMENT ON COLUMN affiliate_referrals.status IS 'Current status of the referral';
COMMENT ON COLUMN affiliate_referrals.commission_amount IS 'Commission amount in the specified currency';
COMMENT ON COLUMN affiliate_referrals.event_type IS 'Type of Rewardful webhook event';
COMMENT ON COLUMN affiliate_referrals.event_data IS 'Complete webhook payload from Rewardful';