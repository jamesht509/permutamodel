
-- Add country column to profiles for BR/US segmentation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR';

-- Update existing profiles to BR (since current users are Brazilian)
UPDATE profiles SET country = 'BR' WHERE country IS NULL;
