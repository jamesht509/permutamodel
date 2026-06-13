-- Add covering indexes for unindexed foreign keys.
--
-- Fixes all 26 `unindexed_foreign_keys` performance advisor warnings.
-- Without a covering index, a FK column forces sequential scans on joins
-- and makes cascading deletes on the parent row slow (Postgres scans the
-- child table to find referencing rows).
--
-- Plain CREATE INDEX (not CONCURRENTLY) because apply_migration runs in a
-- transaction and the tables are tiny at this stage — the brief lock is
-- negligible. If a future index add targets a large table, switch that one
-- to CONCURRENTLY and run it outside a migration transaction.
--
-- Naming convention follows existing indexes: idx_<table>_<column>.
-- IF NOT EXISTS keeps this idempotent.

-- ── applications ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications (applicant_id);

-- ── blocked_users ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON public.blocked_users (blocked_id);

-- ── casting_calls ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_casting_calls_creator_id ON public.casting_calls (creator_id);

-- ── conversations ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON public.conversations (user2_id);

-- ── emergency_contacts ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts (user_id);

-- ── favorites ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_favorites_favorited_user_id ON public.favorites (favorited_user_id);

-- ── feedback ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);

-- ── messages ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- ── notifications ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- ── photo_likes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_photo_likes_user_id ON public.photo_likes (user_id);

-- ── photos ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_photos_credits_user_id ON public.photos (credits_user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos (user_id);

-- ── reports ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON public.reports (reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports (reporter_id);

-- ── reviews ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews (reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews (reviewer_id);

-- ── sessions ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_cancelled_by ON public.sessions (cancelled_by);
CREATE INDEX IF NOT EXISTS idx_sessions_model_id ON public.sessions (model_id);
CREATE INDEX IF NOT EXISTS idx_sessions_photographer_id ON public.sessions (photographer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_request_id ON public.sessions (request_id);

-- ── shared_galleries ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shared_galleries_model_id ON public.shared_galleries (model_id);
CREATE INDEX IF NOT EXISTS idx_shared_galleries_photographer_id ON public.shared_galleries (photographer_id);
CREATE INDEX IF NOT EXISTS idx_shared_galleries_session_id ON public.shared_galleries (session_id);

-- ── tfp_requests ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tfp_requests_receiver_id ON public.tfp_requests (receiver_id);
CREATE INDEX IF NOT EXISTS idx_tfp_requests_sender_id ON public.tfp_requests (sender_id);
