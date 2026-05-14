import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Star, Filter, X, MapPin, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/hooks/useTranslation";
import CreateCastingModal from "@/components/castings/CreateCastingModal";

// FASE 6 BR vocab — style filter list is domain vocabulary and may need
// localization/replacement once the BR styles taxonomy is decided.
const STYLE_FILTERS = ["Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art", "Fitness", "Commercial", "Street", "Conceptual"];

interface CastingCard {
  id: string;
  title: string;
  description: string;
  styles: string[];
  type_needed: string[];
  proposed_date: string | null;
  proposed_time: string | null;
  is_flexible_date: boolean | null;
  location: string | null;
  slots: number;
  filled_slots: number | null;
  status: string;
  duration: string | null;
  moodboard_urls: string[] | null;
  created_at: string | null;
  creator_id: string;
  creator: { name: string; avatar_url: string | null; rating_avg: number | null; verified_level: string } | null;
  applicationCount: number;
  hasApplied: boolean;
}

type Tab = "open" | "mine" | "applied";

export default function Castings() {
  const { user } = useAuth();
  const brand = useBrand();
  const t = useTranslation();
  const navigate = useNavigate();

  const timeAgo = (d: string | null): string => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    return t.castingsPage.timeAgo(mins, hours, days);
  };
  const [tab, setTab] = useState<Tab>("open");
  const [castings, setCastings] = useState<CastingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStyles, setFilterStyles] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState("");

  const fetchCastings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Country-scoped feed (Fase 6): BR users only see BR castings, US
    // only US. Mirrors the Discover.tsx split. Applies to every tab —
    // "mine" is moot (user is in one country), but the constraint stays
    // for consistency and protects against legacy cross-brand rows if
    // a user ever migrates country.
    let query = supabase
      .from("casting_calls")
      .select("*")
      .eq("country", brand.country)
      .order("created_at", { ascending: false });

    if (tab === "open") query = query.eq("status", "open");
    else if (tab === "mine") query = query.eq("creator_id", user.id);

    const { data: castingData } = await query;
    if (!castingData) { setCastings([]); setLoading(false); return; }

    let appliedCastingIds: string[] = [];
    if (tab === "applied") {
      const { data: apps } = await supabase.from("applications").select("casting_id").eq("applicant_id", user.id);
      appliedCastingIds = apps?.map((a) => a.casting_id) || [];
    }

    let filtered = tab === "applied" ? castingData.filter((c) => appliedCastingIds.includes(c.id)) : castingData;

    // Apply filters (only on open tab)
    if (tab === "open") {
      if (filterStyles.length > 0) {
        filtered = filtered.filter((c) => c.styles.some((s: string) => filterStyles.includes(s)));
      }
      if (filterLocation.trim()) {
        const loc = filterLocation.toLowerCase();
        filtered = filtered.filter((c) => c.location?.toLowerCase().includes(loc));
      }
    }

    const creatorIds = [...new Set(filtered.map((c) => c.creator_id))];
    const { data: creators } = creatorIds.length > 0
      ? await supabase.from("profiles").select("id, name, avatar_url, rating_avg, verified_level").in("id", creatorIds)
      : { data: [] };
    const creatorMap = new Map<string, { name: string; avatar_url: string | null; rating_avg: number | null; verified_level: string }>(creators?.map((p) => [p.id, p] as const) || []);

    const castingIds = filtered.map((c) => c.id);
    const { data: appCounts } = castingIds.length > 0
      ? await supabase.from("applications").select("casting_id").in("casting_id", castingIds)
      : { data: [] };
    const countMap = new Map<string, number>();
    appCounts?.forEach((a) => countMap.set(a.casting_id, (countMap.get(a.casting_id) || 0) + 1));

    const { data: userApps } = castingIds.length > 0
      ? await supabase.from("applications").select("casting_id").eq("applicant_id", user.id).in("casting_id", castingIds)
      : { data: [] };
    const appliedSet = new Set(userApps?.map((a) => a.casting_id) || []);

    const mapped: CastingCard[] = filtered.map((c) => ({
      ...c,
      creator: creatorMap.get(c.creator_id) || null,
      applicationCount: countMap.get(c.id) || 0,
      hasApplied: appliedSet.has(c.id),
    }));
    setCastings(mapped);
    setLoading(false);
  }, [user, brand.country, tab, filterStyles, filterLocation]);

  useEffect(() => { fetchCastings(); }, [fetchCastings]);

  const activeFilters = filterStyles.length + (filterLocation.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">{t.castings.title}</h1>
          <div className="flex gap-2">
            {tab === "open" && (
              <button onClick={() => setShowFilters(!showFilters)} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${activeFilters > 0 ? "bg-primary/15 border-primary text-primary" : "border-border text-muted-foreground"}`}>
                <Filter className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setShowCreate(true)} className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {([["open", t.castingsPage.tabOpen], ["mine", t.castingsPage.tabMine], ["applied", t.castingsPage.tabApplied]] as [Tab, string][]).map(([tabKey, label]) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                tab === tabKey ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "bg-card/50 text-muted-foreground border border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && tab === "open" && (
          <div className="px-4 pb-3 space-y-2 border-t border-border pt-3">
            <input
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder={t.castingsPage.filterByLocation}
              className="w-full px-3 py-2 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-body focus:outline-none focus:border-primary/40"
            />
            <div className="flex flex-wrap gap-1.5">
              {STYLE_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStyles(filterStyles.includes(s) ? filterStyles.filter(x => x !== s) : [...filterStyles, s])}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-body font-medium transition-all ${
                    filterStyles.includes(s) ? "bg-primary/20 text-primary border border-primary/30" : "bg-card/50 text-muted-foreground border border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { setFilterStyles([]); setFilterLocation(""); }} className="text-xs text-destructive font-body flex items-center gap-1">
                <X className="w-3 h-3" /> {t.castingsPage.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-card/40 border border-border animate-pulse" />
            ))}
          </div>
        ) : castings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
              {tab === "mine" ? t.castingsPage.emptyMineTitle : tab === "applied" ? t.castingsPage.emptyAppliedTitle : t.castings.noCastings}
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-5">
              {tab === "mine" ? t.castingsPage.emptyMineSub : t.castings.noCastingsSub}
            </p>
            {tab === "mine" && (
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold text-sm">
                {t.castingsPage.createCtaInEmpty}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {castings.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/castings/${c.id}`)}
                className="bg-card/40 border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 mb-3">
                  {c.creator?.avatar_url ? (
                    <img src={c.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {c.creator?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-sm font-body truncate">
                      {c.creator?.name}{c.creator?.verified_level !== "none" ? " ✓" : ""}
                    </p>
                    <p className="text-muted-foreground text-xs font-body flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" /> {Number(c.creator?.rating_avg || 0).toFixed(1)} • {timeAgo(c.created_at)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                    c.status === "open" ? "bg-green-500/15 text-green-400" :
                    c.status === "filled" ? "bg-primary/15 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {c.status === "open" ? t.castings.open : c.status === "filled" ? t.castings.filled : c.status === "expired" ? t.castings.expired : c.status}
                  </span>
                </div>

                <h3 className="text-foreground font-bold text-base font-heading mb-1">{c.title}</h3>
                <p className="text-muted-foreground text-sm font-body mb-3 line-clamp-2">{c.description}</p>

                <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground font-body">
                  {c.proposed_date && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {c.is_flexible_date ? t.castings.flexible : c.proposed_date}</span>}
                  {c.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>}
                  {c.duration && <span>{c.duration}</span>}
                  <span>{t.castingsPage.filledLabel(c.filled_slots || 0, c.slots)}</span>
                  <span>{t.castingsPage.appliedLabel(c.applicationCount)}</span>
                </div>

                {c.styles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.styles.slice(0, 4).map((s) => (
                      <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-body font-medium">{s}</span>
                    ))}
                    {c.styles.length > 4 && <span className="text-[11px] px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-body">+{c.styles.length - 4}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCastingModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchCastings} />
    </div>
  );
}
