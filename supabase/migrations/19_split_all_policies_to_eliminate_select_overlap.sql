-- Eliminate `multiple_permissive_policies` overlap in SELECT for 4 tables.
--
-- Each table had a public-read policy (SELECT) plus a user-write policy
-- declared as FOR ALL — which makes the user-write policy also fire on
-- SELECT, producing N×roles overlap warnings on top of the genuine
-- viewable-by-everyone path.
--
-- Pattern: drop the FOR ALL policy and recreate INSERT / UPDATE / DELETE
-- policies with identical predicates. The SELECT side then has just the
-- public-read policy (plus the admin SELECT policy where present, which
-- is intentional and stays — admin separation is by design).
--
-- Pure behavior-preserving cleanup: every old (cmd, role) combination
-- still resolves to the same boolean. No new access; no removed access.
-- Verified by re-running get_advisors after apply.
--
-- Idempotent: each block drops by name before recreating.

-- ── sessions: "Sessions visible to involved" is byte-identical to the
--    SELECT slice of "Involved users can manage sessions". Drop the
--    duplicate; the FOR ALL policy keeps covering SELECT for participants.
DROP POLICY IF EXISTS "Sessions visible to involved" ON public.sessions;

-- ── shared_galleries: split ALL → INSERT / UPDATE / DELETE. SELECT for
--    participants is already handled by "Galleries visible to involved".
DROP POLICY IF EXISTS "Photographer can manage galleries" ON public.shared_galleries;

CREATE POLICY "Photographer can insert galleries" ON public.shared_galleries
  FOR INSERT
  WITH CHECK ((select auth.uid()) = photographer_id);
CREATE POLICY "Photographer can update galleries" ON public.shared_galleries
  FOR UPDATE
  USING ((select auth.uid()) = photographer_id);
CREATE POLICY "Photographer can delete galleries" ON public.shared_galleries
  FOR DELETE
  USING ((select auth.uid()) = photographer_id);

-- ── casting_calls: split ALL → INSERT / UPDATE / DELETE. SELECT side now
--    has just "Castings are viewable by everyone" (+ admin_read_all_*).
DROP POLICY IF EXISTS "Users can manage own castings" ON public.casting_calls;

CREATE POLICY "Users can insert own castings" ON public.casting_calls
  FOR INSERT
  WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY "Users can update own castings" ON public.casting_calls
  FOR UPDATE
  USING ((select auth.uid()) = creator_id);
CREATE POLICY "Users can delete own castings" ON public.casting_calls
  FOR DELETE
  USING ((select auth.uid()) = creator_id);

-- ── photos: split ALL → INSERT / UPDATE / DELETE. SELECT side now has
--    just "Photos are viewable by everyone".
DROP POLICY IF EXISTS "Users can manage own photos" ON public.photos;

CREATE POLICY "Users can insert own photos" ON public.photos
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own photos" ON public.photos
  FOR UPDATE
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own photos" ON public.photos
  FOR DELETE
  USING ((select auth.uid()) = user_id);
