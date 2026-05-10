
-- Create photo_likes table
CREATE TABLE public.photo_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photo likes viewable by everyone"
ON public.photo_likes FOR SELECT USING (true);

CREATE POLICY "Users can like photos"
ON public.photo_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike photos"
ON public.photo_likes FOR DELETE USING (auth.uid() = user_id);

-- Add likes_count to photos for quick access
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION public.update_photo_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photos SET likes_count = likes_count + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.photos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_photo_like_change
AFTER INSERT OR DELETE ON public.photo_likes
FOR EACH ROW EXECUTE FUNCTION public.update_photo_likes_count();
