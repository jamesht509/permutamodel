import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Search as SearchIcon, Lock, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

const STYLE_OPTIONS = [
  "Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art",
  "Fitness", "Commercial", "Street", "Conceptual", "Beauty", "Maternity",
  "Couples", "Events",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Morning", "Afternoon", "Evening", "Night"];
const EXPERIENCE = ["Beginner", "Intermediate", "Professional"];
const LAST_ACTIVE = [
  { label: "Online Now", value: "now" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

export default function SearchPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();

  const [nameQuery, setNameQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [radius, setRadius] = useState(50);
  const [styles, setStyles] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [experience, setExperience] = useState("");
  const [availDays, setAvailDays] = useState<string[]>([]);
  const [availTimes, setAvailTimes] = useState<string[]>([]);
  const [lastActive, setLastActive] = useState("");
  const [hasStudio, setHasStudio] = useState(false);

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);

  const countMatches = useCallback(async () => {
    if (!user) return;
    setCounting(true);

    // If radius filter is set, get nearby profile IDs first
    let radiusIds: string[] | null = null;
    if (radius !== 50 && profile?.lat && profile?.lng) {
      const { data: nearbyData } = await supabase.rpc('get_profiles_within_radius', {
        user_lat: profile.lat,
        user_lng: profile.lng,
        radius_km: radius,
      });
      radiusIds = nearbyData?.map((p: any) => p.id) || [];
      if (radiusIds.length === 0) {
        setMatchCount(0);
        setCounting(false);
        return;
      }
    }

    let query = supabase
      .from("profiles")
      .select("id, availability", { count: "exact", head: availDays.length === 0 && availTimes.length === 0 })
      .eq("is_banned", false)
      .eq("onboarding_completed", true)
      .eq("private_mode", false)
      .neq("id", user.id);

    if (nameQuery.trim()) query = query.ilike("name", `%${nameQuery.trim()}%`);

    if (typeFilter) {
      if (typeFilter === "photographer") query = query.in("role", ["photographer", "dual"]);
      else if (typeFilter === "model") query = query.in("role", ["model", "dual"]);
      else query = query.eq("role", typeFilter as any);
    }

    if (locationQuery.trim()) {
      query = query.or(`city.ilike.%${locationQuery.trim()}%,state.ilike.%${locationQuery.trim()}%,zip.ilike.%${locationQuery.trim()}%`);
    }

    if (styles.length > 0) query = query.overlaps("styles", styles);
    if (minRating > 0) query = query.gte("rating_avg", minRating);
    if (verifiedOnly) query = query.neq("verified_level", "none");
    if (hasStudio) query = query.eq("has_studio", true);
    if (radiusIds) query = query.in("id", radiusIds);

    if (lastActive === "now") {
      const fiveMin = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      query = query.gte("last_active", fiveMin);
    } else if (lastActive === "week") {
      const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("last_active", week);
    } else if (lastActive === "month") {
      const month = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("last_active", month);
    }

    if (experience) {
      const levelMap: Record<string, string[]> = {
        Beginner: ["newcomer", "starter"],
        Intermediate: ["rising", "established"],
        Professional: ["elite", "legend"],
      };
      if (levelMap[experience]) query = query.in("user_level", levelMap[experience] as any);
    }

    // For availability (days/times), we need client-side filtering since it's JSONB
    if (availDays.length > 0 || availTimes.length > 0) {
      const { data, count: totalBeforeAvail } = await query;
      const filtered = (data || []).filter((p: any) => {
        const avail = p.availability || {};
        const profileDays: string[] = avail.days || [];
        const profileTimes: string[] = avail.times || [];
        const daysMatch = availDays.length === 0 || availDays.some((d) => profileDays.includes(d));
        const timesMatch = availTimes.length === 0 || availTimes.some((t) => profileTimes.includes(t));
        return daysMatch && timesMatch;
      });
      setMatchCount(filtered.length);
    } else {
      const { count } = await query;
      setMatchCount(count ?? 0);
    }

    setCounting(false);
  }, [user, profile, nameQuery, typeFilter, locationQuery, radius, styles, minRating, verifiedOnly, experience, lastActive, hasStudio, availDays, availTimes]);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("collabshoot_search_filters");
    if (saved) {
      try {
        const f = JSON.parse(saved);
        if (f.type) setTypeFilter(f.type);
        if (f.location) setLocationQuery(f.location);
        if (f.styles?.length) setStyles(f.styles);
        if (f.rating) setMinRating(f.rating);
        if (f.verified) setVerifiedOnly(f.verified);
        if (f.experience) setExperience(f.experience);
        if (f.active) setLastActive(f.active);
        if (f.studio) setHasStudio(f.studio);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(countMatches, 400);
    return () => clearTimeout(timer);
  }, [countMatches]);

  const clearAll = () => {
    localStorage.removeItem("collabshoot_search_filters");
    setNameQuery(""); setTypeFilter(""); setLocationQuery(""); setRadius(25);
    setStyles([]); setMinRating(0); setVerifiedOnly(false); setExperience("");
    setAvailDays([]); setAvailTimes([]); setLastActive(""); setHasStudio(false);
  };

  const applyFilters = () => {
    localStorage.setItem("collabshoot_search_filters", JSON.stringify({
      type: typeFilter, location: locationQuery, styles, rating: minRating,
      verified: verifiedOnly, experience, active: lastActive, studio: hasStudio,
      radius, days: availDays, times: availTimes,
    }));

    const params = new URLSearchParams();
    if (nameQuery) params.set("q", nameQuery);
    if (typeFilter) params.set("type", typeFilter);
    if (locationQuery) params.set("loc", locationQuery);
    if (radius !== 25) params.set("radius", String(radius));
    if (styles.length) params.set("styles", styles.join(","));
    if (minRating > 0) params.set("rating", String(minRating));
    if (verifiedOnly) params.set("verified", "1");
    if (experience) params.set("exp", experience);
    if (lastActive) params.set("active", lastActive);
    if (hasStudio) params.set("studio", "1");
    if (availDays.length) params.set("days", availDays.join(","));
    if (availTimes.length) params.set("times", availTimes.join(","));
    navigate(`/discover?${params.toString()}`);
  };

  const Toggle = ({ value, onChange, label, locked }: { value: boolean; onChange: (v: boolean) => void; label: string; locked?: boolean }) => (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-foreground flex items-center gap-1.5">
        {label} {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
      </span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-muted"}`}
      >
        <div className="w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 left-0.5 transition-transform"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background pb-28"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading text-lg font-bold text-foreground">{t.searchPage.title}</h1>
        </div>
        <button onClick={clearAll} className="text-xs font-body text-primary hover:text-primary/80">{t.searchPage.clearAll}</button>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Name */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder={t.searchPage.searchByName}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.searchPage.type}</label>
          <div className="flex gap-2">
            {[{ label: "All", value: "" }, { label: "📸 Photographer", value: "photographer" }, { label: "🌟 Model", value: "model" }, { label: "🎨 Creative", value: "creative" }].map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  typeFilter === t.value ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location + Radius */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.discover.location}</label>
          <input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder={t.discover.locationPlaceholder}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="text-xs font-body text-muted-foreground mt-2 mb-1 block">Radius: {radius} mi</label>
          <input type="range" min={5} max={100} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Styles */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.discover.specialties}</label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStyles((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  styles.includes(s) ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Min Rating */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.searchPage.minRating}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setMinRating(minRating === s ? 0 : s)} className="p-0.5">
                <Star className={`w-7 h-7 transition-colors ${s <= minRating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
              </button>
            ))}
          </div>
        </div>

        <Toggle value={verifiedOnly} onChange={setVerifiedOnly} label={t.searchPage.verifiedOnly} locked />

        {/* Experience */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.discover.experienceLevel}</label>
          <div className="flex gap-2">
            {EXPERIENCE.map((e) => (
              <button
                key={e}
                onClick={() => setExperience(experience === e ? "" : e)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  experience === e ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.searchPage.availableDays}</label>
          <div className="flex gap-1.5 mb-2">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setAvailDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d])}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-body font-medium transition-all ${
                  availDays.includes(d) ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setAvailTimes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  availTimes.includes(t) ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Last Active */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.searchPage.lastActive}</label>
          <div className="flex gap-2">
            {LAST_ACTIVE.map((la) => (
              <button
                key={la.value}
                onClick={() => setLastActive(lastActive === la.value ? "" : la.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  lastActive === la.value ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {la.label}
              </button>
            ))}
          </div>
        </div>

        <Toggle value={hasStudio} onChange={setHasStudio} label={t.searchPage.hasStudio} />
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-[4.5rem] lg:bottom-0 left-0 right-0 lg:left-64 bg-background/95 backdrop-blur-xl border-t border-border p-4 z-30 safe-area-pb">
        <p className="text-center text-xs font-body text-muted-foreground mb-2">
          {counting ? t.searchPage.counting : matchCount !== null ? `${matchCount} ${matchCount !== 1 ? t.searchPage.matches : t.searchPage.match}` : ""}
        </p>
        <button
          onClick={applyFilters}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold text-base hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          {t.searchPage.applyFilters}
        </button>
      </div>
    </motion.div>
  );
}
