const NOMINATIM_API = "https://nominatim.openstreetmap.org";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
}

export async function geocodeAddress(city: string, state: string): Promise<LocationData | null> {
  try {
    const query = `${city}, ${state}, USA`;
    const response = await fetch(
      `${NOMINATIM_API}/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`,
      { headers: { 'User-Agent': 'CollabShoot/1.0' } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        city,
        state,
        country: 'USA'
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_API}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'CollabShoot/1.0' } }
    );
    const data = await response.json();
    if (data && data.address) {
      return {
        latitude: lat,
        longitude: lng,
        city: data.address.city || data.address.town || data.address.village || '',
        state: data.address.state || '',
        country: data.address.country || 'USA'
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
