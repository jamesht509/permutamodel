
-- 1. Photo comments table
CREATE TABLE IF NOT EXISTS photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_photo_comments_photo ON photo_comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_comments_user ON photo_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_comments_created ON photo_comments(created_at DESC);

-- 3. RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_comments" ON photo_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_insert_own_comments" ON photo_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_comments" ON photo_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admin_manage_comments" ON photo_comments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- 4. Auto-sync likes_count
CREATE OR REPLACE FUNCTION public.update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_photo_likes_count ON photo_likes;
CREATE TRIGGER trigger_photo_likes_count
  AFTER INSERT OR DELETE ON photo_likes
  FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count();

-- 5. Add comments_count to photos
ALTER TABLE photos ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 6. Auto-sync comments_count
CREATE OR REPLACE FUNCTION public.update_photo_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_photo_comments_count ON photo_comments;
CREATE TRIGGER trigger_photo_comments_count
  AFTER INSERT OR DELETE ON photo_comments
  FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count();
