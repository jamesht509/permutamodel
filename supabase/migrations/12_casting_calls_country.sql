-- Fase 6: scope castings by country, mirroring the profiles.country split.
-- Casting calls created from a BR session should only surface in the
-- /castings feed of BR users (and vice versa for the legacy US base).
-- 0 rows in the table at apply time → DEFAULT 'BR' is safe without a
-- backfill UPDATE. Index keeps the .eq filter cheap as the table grows.

ALTER TABLE public.casting_calls
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'BR';

CREATE INDEX IF NOT EXISTS idx_casting_calls_country ON public.casting_calls(country);
