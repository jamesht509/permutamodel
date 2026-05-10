import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, MapPin, Star, Heart, Search, ChevronDown, X, SlidersHorizontal, Lock, Zap, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { calculateDistance } from "@/lib/geocoding";
import SEOHead from "@/components/SEOHead";
import { useDevice } from "@/hooks/useDevice";
import CastingsTab from "@/components/discover/CastingsTab";
import { useTranslation } from "@/hooks/useTranslation";
import { useBrand } from "@/hooks/useBrand";

const ROLE_FILTERS = [
  { label: "All", value: "" },
  { label: "Photographers", value: "photographer" },
  { label: "Models", value: "model" },
];

const SPECIALTIES = [
  "Portrait", "Fashion", "Editorial", "Street", "Boudoir",
  "Commercial", "Lifestyle", "Fine Art", "Fitness", "Beauty",
  "Conceptual", "Events", "Couples", "Maternity",
];

const EXPERIENCE_LEVELS = [
  { label: "All Levels", value: "" },
  { label: "Beginner", value: "newcomer" },
  { label: "Intermediate", value: "rising" },
  { label: "Advanced", value: "established" },
  { label: "Professional", value: "elite" },
];

const SORT_OPTIONS = [
  { label: "Highest Rated", value: "rating" },
  { label: "Recently Active", value: "active" },
  { label: "Newest", value: "newest" },
];

interface ProfileCard {
  id: string;
  name: string;
  role: string;
  city: string | null;
  state: string | null;
  rating_avg: number | null;
  total_reviews: number | null;
  verified_level: string;
  plan: string;
  styles: string[] | null;
  avatar_url: string | null;
  last_active: string | null;
  cover_url: string | null;
  user_level: string;
  lat: number | null;
  lng: number | null;
  available_now?: boolean;
  available_until?: string | null;
}

const PAGE_SIZE = 20;

export default function Discover() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const t = useTranslation();
  const brand = useBrand();
  const [searchParams] = useSearchParams();
  const [discoverTab, setDiscoverTab] = useState<"creatives" | "castings">("creatives");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState(() => {
    const type = searchParams.get("type") || "";
    return type;
  });
  const [styleFilter, setStyleFilter] = useState<string[]>(() => {
    const s = searchParams.get("styles");
    return s ? s.split(",") : [];
  });
  const [experienceFilter, setExperienceFilter] = useState(() => {
    const exp = searchParams.get("exp") || "";
    const expMap: Record<string, string> = { Beginner: "newcomer", Intermediate: "rising", Professional: "elite" };
    return expMap[exp] || exp;
  });
  const [locationQuery, setLocationQuery] = useState(searchParams.get("loc") || "");
  const [sort, setSort] = useState("rating");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(() => {
    const r = searchParams.get("radius");
    return r ? Number(r) : null;
  });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [filterDays] = useState<string[]>(() => {
    const d = searchParams.get("days");
    return d ? d.split(",") : [];
  });
  const [filterTimes] = useState<string[]>(() => {
    const t = searchParams.get("times");
    return t ? t.split(",") : [];
  });

  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableNow, setAvailableNow] = useState<any[]>([]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Close filters on browser back
  useEffect(() => {
    if (!showFilters) return;
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowFilters(false);
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showFilters]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("favorited_user_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f) => f.favorited_user_id)));
      });

    // Load available now
    (supabase
      .from("profiles")
      .select("id, name, role, city, state, avatar_url, availability_note, available_until")
      .eq("available_now", true)
      .eq("private_mode", false)
      .neq("id", user.id)
      .eq("country", brand.country)
      .gte("available_until", new Date().toISOString())
      .order("available_until", { ascending: true })
      .limit(10) as any)
      .then(({ data }: any) => {
        if (data) setAvailableNow(data);
      });
  }, [user]);

  const fetchProfiles = useCallback(
    async (pageNum: number, append = false) => {
      if (!user) return;
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from("profiles")
        .select("id, name, role, city, state, rating_avg, total_reviews, verified_level, plan, styles, avatar_url, last_active, user_level, lat, lng, available_now, available_until, availability", { count: "exact" })
      .eq("is_banned", false)
        .eq("onboarding_completed", true)
        .eq("private_mode", false)
        .neq("id", user.id)
        .eq("country", brand.country);

      // Search by name or city
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,city.ilike.%${searchQuery.trim()}%`);
      }

      // Role filter
      if (roleFilter) {
        if (roleFilter === "photographer") {
          query = query.in("role", ["photographer", "dual"]);
        } else if (roleFilter === "model") {
          query = query.in("role", ["model", "dual"]);
        } else {
          query = query.eq("role", roleFilter as any);
        }
      }

      // Style filter
      if (styleFilter.length > 0) {
        query = query.overlaps("styles", styleFilter);
      }

      // Experience filter
      if (experienceFilter) {
        query = query.eq("user_level", experienceFilter as any);
      }

      // Location filter
      if (locationQuery.trim()) {
        query = query.or(`city.ilike.%${locationQuery.trim()}%,state.ilike.%${locationQuery.trim()}%`);
      }

      // Distance filter using RPC
      let distanceMap: Record<string, number> = {};
      if (maxDistance && profile?.lat && profile?.lng) {
        const { data: nearbyData } = await supabase.rpc('get_profiles_within_radius', {
          user_lat: profile.lat,
          user_lng: profile.lng,
          radius_miles: maxDistance,
        });
        if (nearbyData && nearbyData.length > 0) {
          const nearbyIds = nearbyData.map((p: any) => p.id);
          nearbyData.forEach((p: any) => { distanceMap[p.id] = p.distance; });
          query = query.in('id', nearbyIds);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      // Available now filter
      if (showOnlyAvailable) {
        query = (query as any).eq("available_now", true).gte("available_until", new Date().toISOString());
      }

      // Sort
      switch (sort) {
        case "rating":
          query = query.order("rating_avg", { ascending: false, nullsFirst: false });
          break;
        case "active":
          query = query.order("last_active", { ascending: false, nullsFirst: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
      }

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) {
        toast.error("Failed to load profiles");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (count !== null) setTotalCount(count);

      // Fetch cover photos
      const ids = (data || []).map((p) => p.id);
      let coverMap: Record<string, string> = {};

      if (ids.length > 0) {
        const { data: photos } = await supabase
          .from("photos")
          .select("user_id, url")
          .in("user_id", ids)
          .eq("is_cover", true);

        if (photos) photos.forEach((p) => { coverMap[p.user_id] = p.url; });

        const missingCover = ids.filter((id) => !coverMap[id]);
        if (missingCover.length > 0) {
          const { data: fallback } = await supabase
            .from("photos")
            .select("user_id, url")
            .in("user_id", missingCover)
            .eq("position", 0);

          if (fallback) fallback.forEach((p) => { if (!coverMap[p.user_id]) coverMap[p.user_id] = p.url; });
        }
      }

      // Filter by availability days/times (client-side, JSONB)
      let filteredData = data || [];
      if (filterDays.length > 0 || filterTimes.length > 0) {
        filteredData = filteredData.filter((p: any) => {
          const avail = p.availability || {};
          const profileDays: string[] = avail.days || [];
          const profileTimes: string[] = avail.times || [];
          const daysMatch = filterDays.length === 0 || filterDays.some((d) => profileDays.includes(d));
          const timesMatch = filterTimes.length === 0 || filterTimes.some((t) => profileTimes.includes(t));
          return daysMatch && timesMatch;
        });
      }

      const mapped: ProfileCard[] = filteredData.map((p) => ({
        ...p,
        cover_url: coverMap[p.id] || p.avatar_url,
      }));

      if (append) {
        setProfiles((prev) => [...prev, ...mapped]);
      } else {
        setProfiles(mapped);
      }

      setHasMore((data || []).length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
    },
    [user, roleFilter, styleFilter, sort, searchQuery, experienceFilter, locationQuery, maxDistance, profile, showOnlyAvailable, filterDays, filterTimes]
  );

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
      setHasMore(true);
      fetchProfiles(0);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [fetchProfiles]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProfiles(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchProfiles]);

  const toggleFavorite = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const isFav = favorites.has(profileId);
    const newFavs = new Set(favorites);
    if (isFav) {
      newFavs.delete(profileId);
      setFavorites(newFavs);
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("favorited_user_id", profileId);
    } else {
      newFavs.add(profileId);
      setFavorites(newFavs);
      await supabase.from("favorites").insert({ user_id: user.id, favorited_user_id: profileId });
    }
  };

  const toggleStyle = (style: string) => {
    setStyleFilter((prev) => prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]);
  };

  const clearAll = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStyleFilter([]);
    setExperienceFilter("");
    setLocationQuery("");
    setMaxDistance(null);
    setShowOnlyAvailable(false);
    setSort("rating");
  };

  const hasActiveFilters = searchQuery || roleFilter || styleFilter.length > 0 || experienceFilter || locationQuery || maxDistance || showOnlyAvailable;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`Discover Creatives — ${brand.name}`} description="Browse photographers and models near you for TFP collaborations." />
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">{t.discover.title}</h1>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1 mt-0.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="w-3 h-3 text-primary" />
              <span>{profile?.city || t.discover.setLocation}{profile?.state ? `, ${profile.state}` : ""}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button className="relative p-2 hover:scale-105 transition-transform" onClick={() => navigate("/notifications")}>
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab selector: Creatives | Castings */}
        <div className="flex gap-1 px-4 pb-2">
          <button
            onClick={() => setDiscoverTab("creatives")}
            className={`px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
              discoverTab === "creatives"
                ? "gold-gradient text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {t.discover.creatives}
          </button>
          <button
            onClick={() => setDiscoverTab("castings")}
            className={`px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all flex items-center gap-1.5 ${
              discoverTab === "castings"
                ? "gold-gradient text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            <Megaphone className="w-3 h-3" />
            {t.discover.castings}
          </button>
        </div>

        {discoverTab === "creatives" && (
        <>
        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.discover.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Role filter chips */}
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                roleFilter === f.value
                  ? "gold-gradient text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Available Now toggle */}
          <button
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all flex items-center gap-1.5 ${
              showOnlyAvailable
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-card text-muted-foreground border border-border hover:border-primary/30"
            }`}
          >
            <Zap className="w-3 h-3" />
            {t.discover.available}
          </button>

          {/* Sort dropdown inline */}
          <div className="relative ml-auto flex-shrink-0">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-6 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                >
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setSort(o.value); setShowSortDropdown(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-xs font-body whitespace-nowrap transition-colors ${
                        sort === o.value ? "text-primary bg-primary/10" : "text-foreground hover:bg-card"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 space-y-4">
                {/* Specialties */}
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-2">{t.discover.specialties}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SPECIALTIES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`px-3 py-1 rounded-full text-[11px] font-body transition-all ${
                          styleFilter.includes(s)
                            ? "gold-gradient text-primary-foreground"
                            : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-2">{t.discover.experienceLevel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPERIENCE_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setExperienceFilter(l.value)}
                        className={`px-3 py-1 rounded-full text-[11px] font-body transition-all ${
                          experienceFilter === l.value
                            ? "gold-gradient text-primary-foreground"
                            : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-2">{t.discover.location}</p>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder={t.discover.locationPlaceholder}
                    className="w-full px-3 py-2 bg-card border border-border rounded-xl font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Distance filter */}
                {profile?.lat && profile?.lng && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-xs text-muted-foreground">{t.discover.distance}</p>
                      <span className="font-body text-xs text-foreground">
                        {maxDistance ? `${maxDistance} mi` : 'Any'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={maxDistance || 100}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] font-body text-muted-foreground mt-1">
                      <span>5 mi</span>
                      <span>100 mi</span>
                    </div>
                    {maxDistance && (
                      <button onClick={() => setMaxDistance(null)} className="text-xs text-primary hover:underline mt-1 font-body">
                        {t.discover.showAllDistances}
                      </button>
                    )}
                  </div>
                )}

                {/* Clear all */}
                {hasActiveFilters && (
                  <button onClick={clearAll} className="font-body text-xs text-primary hover:underline">
                    {t.discover.clearAllFilters}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </div>

      {discoverTab === "castings" ? (
        <CastingsTab />
      ) : (
      <>
      {/* Results count */}
      {!loading && (
        <div className="px-4 pt-3 pb-1">
          <p className="font-body text-xs text-muted-foreground">
            {t.discover.showing} <span className="text-foreground font-medium">{totalCount}</span> {totalCount !== 1 ? t.discover.creativeS : t.discover.creative}
          </p>
        </div>
      )}

      {/* Available Now Section */}
      {availableNow.length > 0 && (
        <div className="px-4 mb-4 pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              <h2 className="font-heading text-base font-bold text-foreground">{t.discover.availableNow}</h2>
            </div>
            <span className="text-xs font-body text-muted-foreground">{availableNow.length} {t.discover.online}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {availableNow.map((p) => (
              <motion.div
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/profile/${p.id}`)}
                className="flex-shrink-0 w-32 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-muted overflow-hidden border-2 border-green-500/50 relative">
                    <FallbackImage
                      src={p.avatar_url}
                      alt={p.name}
                      fallbackLabel={p.name}
                      imageClassName="w-full h-full object-cover"
                      fallbackClassName="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary"
                    />
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                  </div>
                  <p className="font-body text-xs font-semibold text-foreground mt-2 truncate">{p.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground truncate">{p.city || "Unknown"}</p>
                  {p.availability_note && (
                    <p className="font-body text-[9px] text-green-400 mt-1 line-clamp-2">{p.availability_note}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`py-3 ${isDesktop ? 'flex gap-6 px-4' : 'px-3'}`}>
        {/* Desktop Sidebar Filters */}
        {isDesktop && (
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-20 bg-card/30 rounded-2xl border border-border p-4 space-y-5">
              <h3 className="font-heading text-sm font-bold text-foreground">{t.common.filter}</h3>

              <div>
                <label className="text-xs font-body text-muted-foreground mb-2 block">Type</label>
                <div className="space-y-1">
                  {ROLE_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setRoleFilter(f.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all ${
                        roleFilter === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body text-muted-foreground mb-2 block">Styles</label>
                <div className="flex flex-wrap gap-1">
                  {SPECIALTIES.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-2 py-1 rounded-full text-[11px] font-body transition-all ${
                        styleFilter.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body text-muted-foreground mb-2 block">Experience</label>
                <div className="space-y-1">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setExperienceFilter(l.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all ${
                        experienceFilter === l.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body text-muted-foreground mb-2 block">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button onClick={clearAll} className="font-body text-xs text-primary hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Grid */}
        <div className="flex-1 min-w-0">
        {loading ? (
          <div className={`grid gap-3 ${isDesktop ? 'grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-heading text-lg text-foreground mb-1">{t.discover.noCreatives}</p>
            <p className="font-body text-sm text-muted-foreground mb-6">{t.discover.noCreativesSub}</p>
            <button
              onClick={clearAll}
              className="gold-gradient px-5 py-2.5 rounded-full font-body text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t.discover.clearAllFilters}
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-3 ${isDesktop ? 'grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
              {profiles.map((p) => {
                const dist = profile?.lat && profile?.lng && p.lat && p.lng
                  ? calculateDistance(profile.lat, profile.lng, p.lat, p.lng)
                  : null;
                return (
                  <ProfileCardComponent
                    key={p.id}
                    profile={p}
                    isFavorite={favorites.has(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => navigate(`/profile/${p.id}`)}
                    distance={dist}
                  />
                );
              })}
            </div>

            {profile?.plan === "free" && profiles.length >= 20 && (
              <div className="text-center py-8 px-4">
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-heading text-sm font-bold text-foreground mb-1">Want to see more?</p>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  PRO members get priority in search results and unlimited scrolling
                </p>
                <button
                  onClick={() => navigate("/pro")}
                  className="px-6 py-2.5 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Upgrade to PRO
                </button>
              </div>
            )}
          </>
        )}

        {loadingMore && (
          <div className={`grid gap-3 mt-3 ${isDesktop ? 'grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`more-${i}`} />
            ))}
          </div>
        )}
        <div ref={loaderRef} className="h-4" />
        </div>
      </div>
      </>
      )}
    </div>
  );
}

function ProfileCardComponent({
  profile,
  isFavorite,
  onToggleFavorite,
  onClick,
  distance,
}: {
  profile: ProfileCard;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
  distance: number | null;
}) {
  const imgSrc = profile.cover_url || profile.avatar_url || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl overflow-hidden bg-card border border-border cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_40px_hsl(37_42%_60%/0.1)] transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <FallbackImage
          src={imgSrc}
          alt={profile.name}
          fallbackLabel={profile.name}
          imageClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          fallbackClassName="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-primary"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Available Now badge */}
        {profile.available_now && profile.available_until && new Date(profile.available_until) > new Date() && (
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary-foreground" />
            <span className="text-[9px] font-body font-bold text-primary-foreground">AVAILABLE</span>
          </div>
        )}

        {/* Badges hidden for now */}

        {/* Favorite */}
        <button
          onClick={(e) => onToggleFavorite(profile.id, e)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 z-10"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "text-primary fill-primary" : "text-foreground/60"}`} />
        </button>

        {/* Info overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-foreground font-bold text-sm font-heading">{profile.name}</p>
            <span className="text-[9px] px-1.5 py-px rounded-md bg-foreground/10 backdrop-blur-sm text-foreground/70 font-body font-medium uppercase tracking-wide">
              {profile.role === "dual" ? "Both" : profile.role}
            </span>
          </div>
          <p className="text-muted-foreground text-xs font-body mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {profile.city || "Unknown"}{profile.state ? `, ${profile.state}` : ""}
            {distance !== null && (
              <span className="text-primary font-medium">· {distance} mi</span>
            )}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-primary text-xs font-semibold font-body">
              {Number(profile.rating_avg || 0).toFixed(1)}
            </span>
            <span className="text-muted-foreground text-[10px] font-body">
              ({profile.total_reviews || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Style tags */}
      <div className="p-3 flex flex-wrap gap-1">
        {(profile.styles || []).slice(0, 2).map((style) => (
          <span key={style} className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-medium font-body">
            {style}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function FallbackImage({
  src,
  alt,
  fallbackLabel,
  imageClassName,
  fallbackClassName,
}: {
  src: string | null | undefined;
  alt: string;
  fallbackLabel: string;
  imageClassName: string;
  fallbackClassName: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <div className={fallbackClassName}>{fallbackLabel?.charAt(0)?.toUpperCase() || "?"}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imageClassName}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <div className="aspect-[3/4] bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
