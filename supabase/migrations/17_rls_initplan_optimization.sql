-- RLS performance: wrap auth.uid() in (select auth.uid()) so Postgres
-- evaluates it once per query (initPlan) instead of once per row.
--
-- Fixes all 58 `auth_rls_initplan` performance advisor warnings. Pure
-- performance change — the boolean result of each policy is identical;
-- only the evaluation strategy changes. No policy logic, role, or command
-- is altered. has_role(auth.uid(), ...) keeps its SECURITY DEFINER call;
-- only the inner auth.uid() argument is wrapped.
--
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
--
-- Idempotent: ALTER POLICY sets the expression outright, safe to re-run.

-- ── applications ───────────────────────────────────────────────────
ALTER POLICY "Applications visible to involved parties" ON public.applications
  USING (((select auth.uid()) = applicant_id) OR ((select auth.uid()) IN (
    SELECT casting_calls.creator_id FROM casting_calls
    WHERE (casting_calls.id = applications.casting_id))));
ALTER POLICY "Casting creator can update applications" ON public.applications
  USING ((select auth.uid()) IN (
    SELECT casting_calls.creator_id FROM casting_calls
    WHERE (casting_calls.id = applications.casting_id)));
ALTER POLICY "Users can create applications" ON public.applications
  WITH CHECK ((select auth.uid()) = applicant_id);
ALTER POLICY "admin_delete_all_applications" ON public.applications
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_read_all_applications" ON public.applications
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_update_all_applications" ON public.applications
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── blocked_users ──────────────────────────────────────────────────
ALTER POLICY "Users can block others" ON public.blocked_users
  WITH CHECK ((blocker_id = (select auth.uid())) AND (blocked_id <> (select auth.uid())));
ALTER POLICY "Users can unblock" ON public.blocked_users
  USING (blocker_id = (select auth.uid()));
ALTER POLICY "Users can view own blocks" ON public.blocked_users
  USING (blocker_id = (select auth.uid()));

-- ── casting_calls ──────────────────────────────────────────────────
ALTER POLICY "Users can manage own castings" ON public.casting_calls
  USING ((select auth.uid()) = creator_id);
ALTER POLICY "admin_delete_all_casting_calls" ON public.casting_calls
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_read_all_casting_calls" ON public.casting_calls
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_update_all_casting_calls" ON public.casting_calls
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── conversations ──────────────────────────────────────────────────
ALTER POLICY "Conversations visible to participants" ON public.conversations
  USING (((select auth.uid()) = user1_id) OR ((select auth.uid()) = user2_id));
ALTER POLICY "Participants can update conversations" ON public.conversations
  USING (((select auth.uid()) = user1_id) OR ((select auth.uid()) = user2_id));
ALTER POLICY "Users can create conversations" ON public.conversations
  WITH CHECK (((select auth.uid()) = user1_id) OR ((select auth.uid()) = user2_id));
ALTER POLICY "admin_read_all_conversations" ON public.conversations
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── emergency_contacts ─────────────────────────────────────────────
ALTER POLICY "Users can manage own emergency contacts" ON public.emergency_contacts
  USING ((select auth.uid()) = user_id);

-- ── favorites ──────────────────────────────────────────────────────
ALTER POLICY "Users can manage own favorites" ON public.favorites
  USING ((select auth.uid()) = user_id);

-- ── feedback ───────────────────────────────────────────────────────
ALTER POLICY "Users can submit feedback" ON public.feedback
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can view own feedback" ON public.feedback
  USING ((select auth.uid()) = user_id);

-- ── messages ───────────────────────────────────────────────────────
ALTER POLICY "Block prevents sending messages" ON public.messages
  WITH CHECK (NOT is_blocked((select auth.uid()), (
    SELECT CASE
      WHEN (c.user1_id = (select auth.uid())) THEN c.user2_id
      ELSE c.user1_id
    END AS user1_id
    FROM conversations c WHERE (c.id = messages.conversation_id))));
ALTER POLICY "Messages visible to conversation participants" ON public.messages
  USING ((select auth.uid()) IN (
    SELECT conversations.user1_id FROM conversations WHERE (conversations.id = messages.conversation_id)
    UNION
    SELECT conversations.user2_id FROM conversations WHERE (conversations.id = messages.conversation_id)));
ALTER POLICY "Recipients can update messages read status" ON public.messages
  USING ((select auth.uid()) IN (
    SELECT conversations.user1_id FROM conversations WHERE (conversations.id = messages.conversation_id)
    UNION
    SELECT conversations.user2_id FROM conversations WHERE (conversations.id = messages.conversation_id)));
ALTER POLICY "Users can send messages" ON public.messages
  WITH CHECK ((select auth.uid()) = sender_id);
ALTER POLICY "admin_read_all_messages" ON public.messages
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── notifications ──────────────────────────────────────────────────
ALTER POLICY "Users can see own notifications" ON public.notifications
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can update own notifications" ON public.notifications
  USING ((select auth.uid()) = user_id);
ALTER POLICY "admin_read_all_notifications" ON public.notifications
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── photo_comments ─────────────────────────────────────────────────
ALTER POLICY "admin_manage_comments" ON public.photo_comments
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE ((user_roles.user_id = (select auth.uid())) AND (user_roles.role = 'admin'::app_role))));
ALTER POLICY "users_delete_own_comments" ON public.photo_comments
  USING ((select auth.uid()) = user_id);
ALTER POLICY "users_insert_own_comments" ON public.photo_comments
  WITH CHECK ((select auth.uid()) = user_id);

-- ── photo_likes ────────────────────────────────────────────────────
ALTER POLICY "Users can like photos" ON public.photo_likes
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can unlike photos" ON public.photo_likes
  USING ((select auth.uid()) = user_id);

-- ── photos ─────────────────────────────────────────────────────────
ALTER POLICY "Users can manage own photos" ON public.photos
  USING ((select auth.uid()) = user_id);

-- ── profiles ───────────────────────────────────────────────────────
ALTER POLICY "Users can insert own profile" ON public.profiles
  WITH CHECK ((select auth.uid()) = id);
ALTER POLICY "Users can update own profile" ON public.profiles
  USING ((select auth.uid()) = id);
ALTER POLICY "admin_read_all_profiles" ON public.profiles
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_update_all_profiles" ON public.profiles
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── reports ────────────────────────────────────────────────────────
ALTER POLICY "Users can create reports" ON public.reports
  WITH CHECK ((select auth.uid()) = reporter_id);
ALTER POLICY "Users can see own reports" ON public.reports
  USING ((select auth.uid()) = reporter_id);
ALTER POLICY "admin_read_all_reports" ON public.reports
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── reviews ────────────────────────────────────────────────────────
ALTER POLICY "Reviews are viewable by everyone" ON public.reviews
  USING ((is_visible = true) OR ((select auth.uid()) = reviewer_id) OR ((select auth.uid()) = reviewed_id));
ALTER POLICY "Users can create reviews" ON public.reviews
  WITH CHECK ((select auth.uid()) = reviewer_id);
ALTER POLICY "admin_read_all_reviews" ON public.reviews
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── sessions ───────────────────────────────────────────────────────
ALTER POLICY "Involved users can manage sessions" ON public.sessions
  USING (((select auth.uid()) = photographer_id) OR ((select auth.uid()) = model_id));
ALTER POLICY "Sessions visible to involved" ON public.sessions
  USING (((select auth.uid()) = photographer_id) OR ((select auth.uid()) = model_id));
ALTER POLICY "admin_delete_all_sessions" ON public.sessions
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_read_all_sessions" ON public.sessions
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_update_all_sessions" ON public.sessions
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- ── shared_galleries ───────────────────────────────────────────────
ALTER POLICY "Galleries visible to involved" ON public.shared_galleries
  USING (((select auth.uid()) = photographer_id) OR ((select auth.uid()) = model_id));
ALTER POLICY "Photographer can manage galleries" ON public.shared_galleries
  USING ((select auth.uid()) = photographer_id);

-- ── tfp_requests ───────────────────────────────────────────────────
ALTER POLICY "Involved users can update TFP requests" ON public.tfp_requests
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));
ALTER POLICY "TFP requests visible to involved" ON public.tfp_requests
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));
ALTER POLICY "Users can send TFP requests" ON public.tfp_requests
  WITH CHECK ((select auth.uid()) = sender_id);
ALTER POLICY "admin_delete_all_tfp_requests" ON public.tfp_requests
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_read_all_tfp_requests" ON public.tfp_requests
  USING (has_role((select auth.uid()), 'admin'::app_role));
ALTER POLICY "admin_update_all_tfp_requests" ON public.tfp_requests
  USING (has_role((select auth.uid()), 'admin'::app_role));
