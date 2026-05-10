
-- Add location_updated_at column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- Create index for proximity queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles (lat, lng);

-- Create Haversine distance function
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  earth_radius CONSTANT DOUBLE PRECISION := 3958.8;
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create RPC to get profiles within radius
CREATE OR REPLACE FUNCTION get_profiles_within_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    calculate_distance(user_lat, user_lng, p.lat, p.lng) as distance
  FROM profiles p
  WHERE 
    p.lat IS NOT NULL 
    AND p.lng IS NOT NULL
    AND calculate_distance(user_lat, user_lng, p.lat, p.lng) <= radius_miles
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql STABLE;
