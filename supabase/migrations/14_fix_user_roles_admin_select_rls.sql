-- Migration 14: fix user_roles admin SELECT policy
-- Old policy used USING (true), which let ANY authenticated user read ALL roles.
-- Replace with has_role() check (SECURITY DEFINER, bypasses RLS so no recursion).
-- Wraps auth.uid() in a subquery for RLS plan caching (perf best practice).
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role));
