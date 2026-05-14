-- Migration 15: lock achievements INSERT to service_role only
-- Achievements are awarded by Edge Functions (e.g. on session complete, review left).
-- No client-side INSERT path. SELECT policy is unchanged (public read remains).
CREATE POLICY "Service role only inserts achievements" ON public.achievements
  FOR INSERT
  TO service_role
  WITH CHECK (true);
