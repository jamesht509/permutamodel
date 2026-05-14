-- Fase 6: switch distance from miles → kilometers.
-- The Brazilian launch uses km in UI; the existing US base also reads
-- the same RPC but with km values now (UI converts on display if ever
-- needed). 0 rows in the DB at the moment so no backfill is required.
--
-- Changes:
--   1. calculate_distance(): swap earth_radius constant 3958.8 (mi) → 6371 (km).
--   2. get_profiles_within_radius(): rename `radius_miles` parameter to
--      `radius_km`. Drop the old signature so callers that still pass
--      the old name fail loudly instead of silently quering with stale
--      semantics.
--   3. profiles.distance_radius DEFAULT: 25 → 50. 25mi ≈ 40km, so 50km
--      keeps a similar effective reach for new signups.

CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  earth_radius CONSTANT DOUBLE PRECISION := 6371;  -- km
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$function$;

DROP FUNCTION IF EXISTS public.get_profiles_within_radius(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION public.get_profiles_within_radius(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision
)
RETURNS TABLE(id uuid, distance double precision)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    public.calculate_distance(user_lat, user_lng, p.lat, p.lng) AS distance
  FROM public.profiles p
  WHERE
    p.lat IS NOT NULL
    AND p.lng IS NOT NULL
    AND public.calculate_distance(user_lat, user_lng, p.lat, p.lng) <= radius_km
  ORDER BY distance ASC;
END;
$function$;

ALTER TABLE public.profiles ALTER COLUMN distance_radius SET DEFAULT 50;
