import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, MapPin, Search, ChevronDown, X, SlidersHorizontal, Zap, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { calculateDistance } from "@/lib/geocoding";
import SEOHead from "@/components/SEOHead";
import CastingsTab from "@/components/discover/CastingsTab";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import AvailableNowStories, { type AvailableNowProfile } from "@/components/discover/AvailableNowStories";
import ProfileFeedCard from "@/components/discover/ProfileFeedCard";
import FiltersSheet from "@/components/filters/FiltersSheet";
import { useTranslation } from "@/hooks/useTranslation";
import { useBrand } from "@/hooks/useBrand";

// FASE 6 BR vocab — SPECIALTIES is domain vocabulary, decision pending.
// Filter VALUES below stay EN (used in DB queries / URL params); LABELS are
// pulled from t.discover.* inside the component so PT-BR text shows up.
const SPECIALTIES = [
  "Portrait", "Fashion", "Editorial", "Street", "Boudoir",
  "Commercial", "Lifestyle", "Fine Art", "Fitness", "Beauty",
  "Conceptual", "Events", "Couples", "Maternity",
];

interface ProfileCard {
  id: string;
  name: string;
  role: string;
  city: string | null;
  state: string | null;
  rating_avg: number | null;
  total_reviews: number | null;
  total_sessions: number | null;
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
  const t = useTranslation();
  const brand = useBrand();

  const ROLE_FILTERS = [
    { label: t.discover.all, value: "" },
    { label: t.discover.photographers, value: "photographer" },
    { label: t.discover.models, value: "model" },
  ];

  const EXPERIENCE_LEVELS = [
    { label: t.discover.allLevels, value: "" },
    { label: t.discover.beginner, value: "newcomer" },
    { label: t.discover.intermediate, value: "rising" },
    { label: t.discover.advanced, value: "established" },
    { label: t.discover.professional, value: "elite" },
  ];

  const SORT_OPTIONS = [
    { label: t.discover.highestRated, value: "rating" },
    { label: t.discover.recentlyActive, value: "active" },
    { label: t.discover.newest, value: "newest" },
  ];
  const [searchParams] = useSearchParams();
  const [discoverTab, setDiscoverTab] = useState<"creatives" | "castings">("creatives");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState(() => searchParams.get("type") || "");
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

  const [unreadCount, setUnreadCount] = useState(0);
  const [availableNow, setAvailableNow] = useState<AvailableNowProfile[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Close desktop filters drawer on browser back
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

    // Load available now (minimal fields for AvailableNowStories)
    (supabase
      .from("profiles")
      .select("id, name, avatar_url, available_until")
      .eq("available_now", true)
      .eq("private_mode", false)
      .neq("id", user.id)
      .eq("country", brand.country)
      .gte("available_until", new Date().toISOString())
      .order("available_until", { ascending: true })
      .limit(10) as any)
      .then(({ data }: any) => {
        if (data) setAvailableNow(data as AvailableNowProfile[]);
      });
  }, [user, brand.country]);

  const fetchProfiles = useCallback(
    async (pageNum: number, append = false) => {
      if (!user) return;
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from("profiles")
        .select("id, name, role, city, state, rating_avg, total_reviews, total_sessions, verified_level, plan, styles, avatar_url, last_active, user_level, lat, lng, available_now, available_until, availability", { count: "exact" })
        .eq("is_banned", false)
        .eq("onboarding_completed", true)
        .eq("private_mode", false)
        .neq("id", user.id)
        .eq("country", brand.country);

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,city.ilike.%${searchQuery.trim()}%`);
      }

      if (roleFilter) {
        if (roleFilter === "photographer") {
          query = query.in("role", ["photographer", "dual"]);
        } else if (roleFilter === "model") {
          query = query.in("role", ["model", "dual"]);
        } else {
          query = query.eq("role", roleFilter as any);
        }
      }

      if (styleFilter.length > 0) {
        query = query.overlaps("styles", styleFilter);
      }

      if (experienceFilter) {
        query = query.eq("user_level", experienceFilter as any);
      }

      if (locationQuery.trim()) {
        query = query.or(`city.ilike.%${locationQuery.trim()}%,state.ilike.%${locationQuery.trim()}%`);
      }

      let distanceMap: Record<string, number> = {};
      if (maxDistance && profile?.lat && profile?.lng) {
        const { data: nearbyData } = await supabase.rpc("get_profiles_within_radius", {
          user_lat: profile.lat,
          user_lng: profile.lng,
          radius_km: maxDistance,
        });
        if (nearbyData && nearbyData.length > 0) {
          const nearbyIds = nearbyData.map((p: any) => p.id);
          nearbyData.forEach((p: any) => { distanceMap[p.id] = p.distance; });
          query = query.in("id", nearbyIds);
        } else {
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      }

      if (showOnlyAvailable) {
        query = (query as any).eq("available_now", true).gte("available_until", new Date().toISOString());
      }

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
        toast.error(t.discover.loadProfilesFailed);
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
        cover_url: coverMap[p.id] || null,
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
    [user, roleFilter, styleFilter, sort, searchQuery, experienceFilter, locationQuery, maxDistance, profile, showOnlyAvailable, filterDays, filterTimes, brand.country, t.discover.loadProfilesFailed]
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

  const distFor = (p: ProfileCard): number | null =>
    profile?.lat && profile?.lng && p.lat && p.lng
      ? calculateDistance(profile.lat, profile.lng, p.lat, p.lng)
      : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.discover.seoTitle(brand.name)} description={t.discover.seoDescription} />

      {/* ─────────── MOBILE LAYOUT (< lg) ─────────── */}
      <div className="lg:hidden">
        <DiscoverHeader
          userCity={profile?.city ?? null}
          userState={profile?.state ?? null}
          notificationCount={unreadCount}
          onSearchClick={() => navigate("/search")}
          onNotificationsClick={() => navigate("/notifications")}
          onCityClick={() => setFiltersOpen(true)}
          onFilterClick={() => setFiltersOpen(true)}
        />

        <AvailableNowStories
          profiles={availableNow}
          onTapStory={(id) => navigate(`/profile/${id}`)}
        />

        <main className="pb-4 pt-2">
          {loading ? (
            <SkeletonFeedList count={5} />
          ) : profiles.length === 0 ? (
            <EmptyState
              title={t.discover.noCreatives}
              subtitle={t.discover.noCreativesSub}
              ctaLabel={t.discover.clearAllFilters}
              onCta={clearAll}
            />
          ) : (
            <>
              {profiles.map((p) => (
                <ProfileFeedCard
                  key={p.id}
                  profile={p}
                  distance={distFor(p)}
                  onTap={(id) => navigate(`/profile/${id}`)}
                  onTapPermuta={(id) => navigate(`/profile/${id}?tfp=1`)}
                />
              ))}
              {loadingMore && <SkeletonFeedList count={2} />}
              <div ref={loaderRef} className="h-4" />
            </>
          )}
        </main>
      </div>

      {/* ─────────── DESKTOP LAYOUT (>= lg) ─────────── */}
      <div className="hidden lg:block">
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
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

              {/* Expanded filters drawer */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-4 space-y-4">
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

                      {profile?.lat && profile?.lng && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-body text-xs text-muted-foreground">{t.discover.distance}</p>
                            <span className="font-body text-xs text-foreground">
                              {maxDistance ? `${maxDistance} ${t.discover.distanceUnit}` : t.discover.distanceAny}
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
                            <span>5 {t.discover.distanceUnit}</span>
                            <span>100 {t.discover.distanceUnit}</span>
                          </div>
                          {maxDistance && (
                            <button onClick={() => setMaxDistance(null)} className="text-xs text-primary hover:underline mt-1 font-body">
                              {t.discover.showAllDistances}
                            </button>
                          )}
                        </div>
                      )}

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
            {!loading && (
              <div className="px-4 pt-3 pb-1">
                <p className="font-body text-xs text-muted-foreground">
                  {t.discover.showing} <span className="text-foreground font-medium">{totalCount}</span> {totalCount !== 1 ? t.discover.creativeS : t.discover.creative}
                </p>
              </div>
            )}

            <div className="py-3 flex gap-6 px-4">
              <aside className="w-64 flex-shrink-0">
                <div className="sticky top-32 bg-card/30 rounded-2xl border border-border p-4 space-y-5">
                  <h3 className="font-heading text-sm font-bold text-foreground">{t.common.filter}</h3>

                  <div>
                    <label className="text-xs font-body text-muted-foreground mb-2 block">{t.searchPage.type}</label>
                    <div className="space-y-1">
                      {ROLE_FILTERS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setRoleFilter(f.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all ${
                            roleFilter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-foreground/5"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-body text-muted-foreground mb-2 block">{t.discover.specialties}</label>
                    <div className="flex flex-wrap gap-1">
                      {SPECIALTIES.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleStyle(s)}
                          className={`px-2 py-1 rounded-full text-[11px] font-body transition-all ${
                            styleFilter.includes(s) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-body text-muted-foreground mb-2 block">{t.discover.experienceLevel}</label>
                    <div className="space-y-1">
                      {EXPERIENCE_LEVELS.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => setExperienceFilter(l.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all ${
                            experienceFilter === l.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-foreground/5"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-body text-muted-foreground mb-2 block">{t.discover.sortBy}</label>
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
                      {t.discover.clearAllFilters}
                    </button>
                  )}
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="grid gap-3 grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonGridCard key={i} />)}
                  </div>
                ) : profiles.length === 0 ? (
                  <EmptyState
                    title={t.discover.noCreatives}
                    subtitle={t.discover.noCreativesSub}
                    ctaLabel={t.discover.clearAllFilters}
                    onCta={clearAll}
                  />
                ) : (
                  <div className="grid gap-3 grid-cols-3 xl:grid-cols-4">
                    {profiles.map((p) => (
                      <ProfileFeedCard
                        key={p.id}
                        profile={p}
                        distance={distFor(p)}
                        onTap={(id) => navigate(`/profile/${id}`)}
                        onTapPermuta={(id) => navigate(`/profile/${id}?tfp=1`)}
                      />
                    ))}
                  </div>
                )}

                {loadingMore && (
                  <div className="grid gap-3 mt-3 grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonGridCard key={`more-${i}`} />)}
                  </div>
                )}
                <div ref={loaderRef} className="h-4" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters bottom sheet — mobile only (component handles lg:hidden) */}
      <FiltersSheet
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        currentFilters={{ styles: styleFilter, radius: maxDistance ?? 200, rating: 0 }}
        onApply={(f) => {
          setStyleFilter(f.styles);
          setMaxDistance(f.radius >= 200 ? null : f.radius);
          // rating filter has no state wired yet — Wave 2 will add it
        }}
        styleOptions={SPECIALTIES}
      />
    </div>
  );
}

function SkeletonFeedList({ count }: { count: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mx-3.5 mb-3.5 bg-surface rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-[5/4] bg-elevated" />
          <div className="px-3.5 py-3 space-y-2">
            <div className="h-3 w-1/3 bg-elevated rounded" />
            <div className="h-2.5 w-1/2 bg-elevated rounded" />
            <div className="h-9 w-full bg-elevated rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonGridCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-[5/4] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  ctaLabel,
  onCta,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-5">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="font-heading text-lg text-foreground mb-1">{title}</p>
      <p className="font-body text-sm text-muted-foreground mb-6">{subtitle}</p>
      <button
        onClick={onCta}
        className="gold-gradient px-5 py-2.5 rounded-full font-body text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
