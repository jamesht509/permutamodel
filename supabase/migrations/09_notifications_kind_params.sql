-- Fase 4: language-agnostic notifications.
-- Add `kind` (e.g. 'tfp_request_new') and `params` (jsonb) so the client
-- renders localized copy via t.notifs[kind](params) instead of relying on
-- pre-translated title/body columns. Legacy title/body remain populated as
-- a fallback during the rollout and for any consumer that hasn't migrated.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS params jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notifications_kind ON public.notifications(kind);
