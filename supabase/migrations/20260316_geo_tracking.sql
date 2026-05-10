-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Geo tracking + device + signup source
-- ============================================

-- 1. Geo tracking on signup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_ip text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_region text;

-- 2. Last known location (updates on each visit)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_known_country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_known_city text;

-- 3. Device info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS device_type text; -- 'iphone', 'android', 'desktop', 'tablet'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS browser text;     -- 'safari', 'chrome', 'firefox', etc.

-- 4. Engagement tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_source text; -- 'instagram', 'tiktok', 'google', 'referral', 'direct', 'other'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- 5. Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
  'signup_ip', 'signup_country', 'signup_city', 'signup_region',
  'last_known_country', 'last_known_city',
  'device_type', 'browser',
  'signup_source', 'login_count', 'last_login_at'
)
ORDER BY column_name;
