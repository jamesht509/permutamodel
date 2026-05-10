import { supabase } from "@/integrations/supabase/client";

interface GeoData {
  country: string;
  city: string;
  region: string;
  ip: string;
}

// Detect device type from user agent
export function detectDevice(): { device: string; browser: string } {
  const ua = navigator.userAgent.toLowerCase();

  let device = "desktop";
  if (/iphone/.test(ua)) device = "iphone";
  else if (/ipad/.test(ua)) device = "ipad";
  else if (/android.*mobile/.test(ua)) device = "android";
  else if (/android/.test(ua)) device = "android-tablet";
  else if (/macintosh.*mobile/.test(ua) || /mobile/.test(ua)) device = "mobile";

  let browser = "other";
  if (/crios/.test(ua)) browser = "chrome-ios";
  else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = "safari";
  else if (/chrome/.test(ua) && !/edg/.test(ua)) browser = "chrome";
  else if (/firefox/.test(ua)) browser = "firefox";
  else if (/edg/.test(ua)) browser = "edge";

  return { device, browser };
}

// Get geo data from IP (free, no API key, HTTPS only)
async function fetchGeo(): Promise<GeoData | null> {
  try {
    // ipapi.co — free 1000 req/day, HTTPS
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return {
      country: data.country_name || "",
      city: data.city || "",
      region: data.region || "",
      ip: data.ip || "",
    };
  } catch {
    return null;
  }
}

// Track on signup — captures everything once
export async function trackSignup(userId: string) {
  const [geo, { device, browser }] = await Promise.all([
    fetchGeo(),
    Promise.resolve(detectDevice()),
  ]);

  const update: Record<string, any> = {
    device_type: device,
    browser,
    login_count: 1,
    last_login_at: new Date().toISOString(),
  };

  if (geo) {
    update.signup_ip = geo.ip;
    update.signup_country = geo.country;
    update.signup_city = geo.city;
    update.signup_region = geo.region;
    update.last_known_country = geo.country;
    update.last_known_city = geo.city;
  }

  await supabase.from("profiles").update(update).eq("id", userId);
}

// Track on login — updates last known location + device + login count
export async function trackLogin(userId: string) {
  const [geo, { device, browser }] = await Promise.all([
    fetchGeo(),
    Promise.resolve(detectDevice()),
  ]);

  const update: Record<string, any> = {
    device_type: device,
    browser,
    last_login_at: new Date().toISOString(),
  };

  if (geo) {
    update.last_known_country = geo.country;
    update.last_known_city = geo.city;
  }

  // Increment login count
  const { data: profile } = await supabase
    .from("profiles")
    .select("login_count")
    .eq("id", userId)
    .single();

  update.login_count = ((profile as any)?.login_count || 0) + 1;

  await supabase.from("profiles").update(update).eq("id", userId);
}
