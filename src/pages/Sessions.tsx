import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, MessageCircle, XCircle, Camera, Star, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReviewModal from "@/components/ReviewModal";
import SharedGallerySection from "@/components/sessions/SharedGallerySection";
import { useTranslation } from "@/hooks/useTranslation";

interface SessionRow {
  id: string;
  date: string;
  time: string | null;
  location: string;
  status: string;
  duration: string | null;
  photographer_id: string;
  model_id: string;
  partner: { id: string; name: string; avatar_url: string | null } | null;
  hasReview: boolean;
}

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();

  const TABS = [t.sessions.upcoming, t.sessions.past, t.sessions.cancelled] as const;
  type TabType = typeof TABS[number];
  const [tab, setTab] = useState<TabType>(TABS[0]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateModal, setRateModal] = useState<{ sessionId: string; partnerId: string; partnerName: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      let statusFilter: ("pending" | "confirmed" | "completed" | "cancelled" | "noshow")[];
      if (tab === TABS[0]) statusFilter = ["pending", "confirmed"];
      else if (tab === TABS[1]) statusFilter = ["completed"];
      else statusFilter = ["cancelled", "noshow"];

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .or(`photographer_id.eq.${user.id},model_id.eq.${user.id}`)
        .in("status", statusFilter)
        .order("date", { ascending: tab === TABS[0] });

      if (error || !data) {
        setLoading(false);
        return;
      }

      const partnerIds = data.map((s) => (s.photographer_id === user.id ? s.model_id : s.photographer_id));
      const uniqueIds = [...new Set(partnerIds)];
      const { data: partners } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", uniqueIds);
      const partnerMap = new Map(partners?.map((p) => [p.id, p]) || []);

      let reviewedSessionIds = new Set<string>();
      if (tab === TABS[1]) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("session_id")
          .eq("reviewer_id", user.id)
          .in("session_id", data.map((s) => s.id));
        reviewedSessionIds = new Set(reviews?.map((r) => r.session_id) || []);
      }

      setSessions(
        data.map((s) => ({
          ...s,
          partner: partnerMap.get(s.photographer_id === user.id ? s.model_id : s.photographer_id) || null,
          hasReview: reviewedSessionIds.has(s.id),
        }))
      );
      setLoading(false);
    };
    load();
  }, [user, tab]);

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  const cancelSession = async (sessionId: string) => {
    if (!user) return;
    await supabase
      .from("sessions")
      .update({ status: "cancelled", cancelled_by: user.id, cancel_reason: "Cancelled by user" })
      .eq("id", sessionId);
    toast.success(t.sessions.cancel);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const getStatusBadge = (session: SessionRow) => {
    if (session.status === "pending") {
      return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">{t.dashboard.pending}</span>;
    }
    if (session.status === "confirmed" && isToday(session.date)) {
      return <span className="px-2.5 py-1 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold animate-pulse">{t.common.today} — {session.time || "TBD"}</span>;
    }
    if (session.status === "confirmed") {
      return <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">✓</span>;
    }
    if (session.status === "completed") {
      return <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">{t.dashboard.completed}</span>;
    }
    if (session.status === "cancelled" || session.status === "noshow") {
      return <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold line-through">{t.sessions.cancel}</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-heading text-lg font-bold text-foreground">{t.sessions.title}</h1>
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {TABS.map((tabLabel) => (
            <button
              key={tabLabel}
              onClick={() => setTab(tabLabel)}
              className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                tab === tabLabel
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  : "bg-card/50 text-muted-foreground border border-border"
              }`}
            >
              {tabLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-card/50 border border-border rounded-2xl animate-pulse" />
          ))
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading text-foreground">{t.sessions.noSessions}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">{t.sessions.noSessionsSub}</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="p-4 rounded-2xl bg-card/50 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  {session.partner?.avatar_url ? (
                    <img src={session.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {session.partner?.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading text-sm font-semibold text-foreground">{session.partner?.name || "Unknown"}</p>
                    {getStatusBadge(session)}
                  </div>
                  <p className="text-xs font-body text-muted-foreground mt-1">
                    <CalendarDays className="w-3 h-3 inline mr-1" />
                    {new Date(session.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    {session.time ? ` ${session.time}` : ""}
                  </p>
                  <p className="text-xs font-body text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {session.location}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {(session.status === "confirmed") && (
                  <>
                    <button
                      onClick={() => navigate("/messages")}
                      className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-body font-medium flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> {t.messages.title}
                    </button>
                    <button
                      onClick={() => cancelSession(session.id)}
                      className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-body font-medium flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> {t.sessions.cancel}
                    </button>
                  </>
                )}
                {session.status === "completed" && !session.hasReview && (
                  <button
                    onClick={() =>
                      setRateModal({
                        sessionId: session.id,
                        partnerId: session.partner?.id || "",
                        partnerName: session.partner?.name || "Unknown",
                      })
                    }
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-body font-semibold flex items-center justify-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" /> {t.dashboard.leaveReview}
                  </button>
                )}
                {session.status === "completed" && session.hasReview && (
                  <span className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-body font-medium text-center">
                    ✓ {t.dashboard.reviewed}
                  </span>
                )}
              </div>

              {session.status === "completed" && user && (
                <SharedGallerySection
                  sessionId={session.id}
                  photographerId={session.photographer_id}
                  modelId={session.model_id}
                />
              )}
            </div>
          ))
        )}
      </div>

      {rateModal && (
        <ReviewModal
          open
          onClose={() => setRateModal(null)}
          sessionId={rateModal.sessionId}
          partnerId={rateModal.partnerId}
          partnerName={rateModal.partnerName}
        />
      )}
    </div>
  );
}