-- Lock down SECURITY DEFINER functions that are internal (triggers and
-- maintenance helpers) so they can't be invoked via PostgREST as
-- /rpc/<name> by anon or authenticated clients. Also drop the broad
-- storage.objects SELECT policies that let any client LIST the public
-- avatars / portfolios buckets — the buckets stay public for direct
-- object URL access (CDN-served), they just no longer enumerate.
--
-- Eliminates:
--   - 8 × anon_security_definer_function_executable warnings
--   - 8 × authenticated_security_definer_function_executable warnings
--   - 2 × public_bucket_allows_listing warnings
--
-- Kept intentionally:
--   - has_role(uuid, app_role): invoked by admin RLS policies on every
--     table; revoking EXECUTE breaks SELECT for normal users hitting an
--     admin policy.
--   - is_blocked(uuid, uuid): invoked by the messages "Block prevents
--     sending messages" RLS policy AND directly by Chat.tsx via
--     supabase.rpc("is_blocked", ...).
--
-- Behavior-preserving: every flagged function is either a trigger (called
-- by Postgres on row events, EXECUTE perm irrelevant) or an unused
-- helper. Storage LIST is not invoked anywhere in the client or edge
-- functions (verified with `grep '.list(' src/ supabase/functions/`).

-- ── SECURITY DEFINER functions: revoke client invocation ───────────
REVOKE EXECUTE ON FUNCTION public.check_availability_expiration() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_mutual_review() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_photo_comments_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_photo_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_level() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_rating() FROM PUBLIC, anon, authenticated;

-- ── Storage: drop broad SELECT (LIST) policies on public buckets ───
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
