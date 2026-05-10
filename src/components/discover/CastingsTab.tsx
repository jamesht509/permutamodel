import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Megaphone, CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ApplyModal from "@/components/castings/ApplyModal";
import ApplicationsModal from "@/components/castings/ApplicationsModal";
import { useTranslation } from "@/hooks/useTranslation";

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
  requirements: string | null;
  created_at: string | null;
  creator_id: string;
  creator: { name: string; avatar_url: string | null; rating_avg: number | null; verified_level: string } | null;
  applicationCount: number;
  hasApplied: boolean;
}

function timeAgo(d: string | null): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CastingsTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [castings, setCastings] = useState<CastingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState<CastingCard | null>(null);
  const [manageTarget, setManageTarget] = useState<string | null>(null);

  const fetchCastings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: castingData } = await supabase
      .from("casting_calls")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!castingData) { setCastings([]); setLoading(false); return; }

    const creatorIds = [...new Set(castingData.map((c) => c.creator_id))];
    const { data: creators } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, rating_avg, verified_level")
      .in("id", creatorIds);
    const creatorMap = new Map(creators?.map((p) => [p.id, p]) || []);

    const castingIds = castingData.map((c) => c.id);
    const { data: appCounts } = await supabase
      .from("applications")
      .select("casting_id")
      .in("casting_id", castingIds);

    const countMap = new Map<string, number>();
    appCounts?.forEach((a) => countMap.set(a.casting_id, (countMap.get(a.casting_id) || 0) + 1));

    const { data: userApps } = await supabase
      .from("applications")
      .select("casting_id")
      .eq("applicant_id", user.id)
      .in("casting_id", castingIds);
    const appliedSet = new Set(userApps?.map((a) => a.casting_id) || []);

    const mapped: CastingCard[] = castingData.map((c) => ({
      ...c,
      creator: creatorMap.get(c.creator_id) || null,
      applicationCount: countMap.get(c.id) || 0,
      hasApplied: appliedSet.has(c.id),
    }));

    setCastings(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCastings(); }, [fetchCastings]);

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-card/40 border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (castings.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-heading text-lg font-bold text-foreground mb-2">{t.castings.noCastings}</h3>
        <p className="font-body text-sm text-muted-foreground">{t.castings.noCastingsSub}</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-4 space-y-3">
        {castings.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card/40 border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
          >
            {/* Creator */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/profile/${c.creator_id}`)}
              >
                {c.creator?.avatar_url ? (
                  <img src={c.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {c.creator?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm font-body truncate">
                  {c.creator?.name}{c.creator?.verified_level !== "none" ? " ✓" : ""}
                </p>
                <p className="text-muted-foreground text-xs font-body flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary fill-primary" /> {Number(c.creator?.rating_avg || 0).toFixed(1)} • {timeAgo(c.created_at)}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-body font-semibold bg-green-500/15 text-green-400">
                {t.castings.open.toLowerCase()}
              </span>
            </div>

            <h3 className="text-foreground font-bold text-base font-heading mb-2">{c.title}</h3>
            <p className="text-muted-foreground text-sm font-body mb-3 line-clamp-2">{c.description}</p>

            <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground font-body">
              {c.proposed_date && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {c.is_flexible_date ? t.castings.flexible : c.proposed_date}</span>}
              {c.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>}
              {c.duration && <span>{c.duration}</span>}
              <span>{c.filled_slots || 0}/{c.slots} {t.castings.filledSlots}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {c.styles.map((s) => (
                <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-body font-medium">{s}</span>
              ))}
            </div>

            {c.moodboard_urls && c.moodboard_urls.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {c.moodboard_urls.map((url, idx) => (
                  <img key={idx} src={url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ))}
              </div>
            )}

            {c.creator_id === user?.id ? (
              <button
                onClick={() => setManageTarget(c.id)}
                className="w-full py-2.5 bg-card border border-border text-foreground text-sm font-body font-semibold rounded-xl hover:bg-card/80 transition-colors"
              >
                {t.castings.manage} ({c.applicationCount})
              </button>
            ) : c.hasApplied ? (
              <button disabled className="w-full py-2.5 bg-card border border-border text-muted-foreground text-sm font-body font-semibold rounded-xl opacity-60">
                {t.castings.applied} ✓
              </button>
            ) : (
              <button
                onClick={() => setApplyTarget(c)}
                className="w-full py-2.5 gold-gradient text-primary-foreground text-sm font-body font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                {t.castings.applyNow} ({c.applicationCount})
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {applyTarget && (
        <ApplyModal casting={applyTarget} onClose={() => setApplyTarget(null)} onApplied={fetchCastings} />
      )}
      {manageTarget && (
        <ApplicationsModal castingId={manageTarget} onClose={() => setManageTarget(null)} onUpdate={fetchCastings} />
      )}
    </>
  );
}
