-- Fase 4 side-fix: drop the NOT NULL constraint on sessions.location so
-- callers (Dashboard accept-flow, review fallback) can persist NULL when
-- the location wasn't proposed yet, instead of seeding the DB with the
-- English string "To be decided" / "Not specified". The UI handles the
-- empty state with t.sessions.locationTBD.

ALTER TABLE public.sessions ALTER COLUMN location DROP NOT NULL;
