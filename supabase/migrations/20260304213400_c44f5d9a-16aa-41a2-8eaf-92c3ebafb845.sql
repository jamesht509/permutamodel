
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS available_now BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS availability_note TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_available_now ON profiles (available_now) WHERE available_now = true;

CREATE OR REPLACE FUNCTION public.check_availability_expiration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles
  SET available_now = false,
      available_until = NULL
  WHERE available_now = true 
    AND available_until < NOW();
END;
$$;
