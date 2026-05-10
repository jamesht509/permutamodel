
-- 1. Add approval system columns to castings
ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- 2. Admin UPDATE policy for casting_calls
CREATE POLICY "admin_update_all_casting_calls" ON casting_calls
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Admin DELETE policy for casting_calls  
CREATE POLICY "admin_delete_all_casting_calls" ON casting_calls
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Admin full control on applications
CREATE POLICY "admin_update_all_applications" ON applications
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_delete_all_applications" ON applications
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_read_all_applications" ON applications
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Admin UPDATE/DELETE on tfp_requests
CREATE POLICY "admin_update_all_tfp_requests" ON tfp_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_delete_all_tfp_requests" ON tfp_requests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Admin UPDATE/DELETE on sessions
CREATE POLICY "admin_update_all_sessions" ON sessions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_delete_all_sessions" ON sessions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
