-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Super Admin: seed profiles + admin policies
-- ============================================

-- 1. Add is_seed column to profiles (marks fake/seed profiles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_seed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Create admin-level RLS policy for profiles (read all)
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 3. Create admin-level RLS policy for profiles (update all)
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 4. Admin policies for other tables
CREATE POLICY "admin_read_all_tfp_requests" ON tfp_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_sessions" ON sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_casting_calls" ON casting_calls
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_reviews" ON reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_conversations" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_messages" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_notifications" ON notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admin_read_all_reports" ON reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- 5. Mark your existing seed profiles (run AFTER you know which are seeds)
-- UPDATE profiles SET is_seed = true WHERE id IN ('uuid1', 'uuid2', ...);

-- 6. Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_seed', 'is_active')
ORDER BY column_name;
