
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS request_preference text DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS hide_distance boolean DEFAULT false;
