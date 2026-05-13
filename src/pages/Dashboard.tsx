import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Clock, CheckCircle, XCircle, Send, MessageCircle, Star,
  Camera, Megaphone, Search, ArrowUpRight, CalendarDays, MapPin, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ReviewModal from "@/components/ReviewModal";
import MyCastingsSection from "@/components/dashboard/MyCastingsSection";
import { useTranslation } from "@/hooks/useTranslation";

interface TfpRequest {
  id: string;
  message: string | null;
  proposed_date: string | null;
  proposed_location: string | null;
  style: string | null;
  status: string;
  created_at: string | null;
  sender_id: string;
  receiver_id: string;
  session_id: string | null;
  sender: { name: string; avatar_url: string | null } | null;
  receiver: { name: string; avatar_url: string | null } | null;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const t = useTranslation();

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 12) return t.discover.goodMorning;
    if (h < 18) return t.discover.goodAfternoon;
    return t.discover.goodEvening;
  };
  const [requests, setRequests] = useState<TfpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [reviewTarget, setReviewTarget] = useState<{ sessionId: string; partnerId: string; partnerName: string } | null>(null);
  const [reviewedSessionIds, setReviewedSessionIds] = useState<Set<string>>(new Set());

  const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string }> = {
    pending: { color: "text-warning", bg: "bg-warning/10", label: t.dashboard.pending, dot: "bg-warning" },
    accepted: { color: "text-success", bg: "bg-success/10", label: t.dashboard.accepted, dot: "bg-[hsl(var(--success))]" },
    declined: { color: "text-destructive", bg: "bg-destructive/10", label: t.dashboard.declined, dot: "bg-destructive" },
    completed: { color: "text-primary", bg: "bg-primary/10", label: t.dashboard.completed, dot: "bg-primary" },
    counter: { color: "text-muted-foreground", bg: "bg-muted", label: t.dashboard.counter, dot: "bg-muted-foreground" },
  };

  useEffect(() => {
    if (!user) return;
    fetchRequests();
    fetchMyReviews();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tfp_requests")
        .select("*, sender:profiles!tfp_requests_sender_id_fkey(name, avatar_url), receiver:profiles!tfp_requests_receiver_id_fkey(name, avatar_url)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests((data as any) || []);
    } catch {
      toast.error(t.dashboard.loadFailed);
    }
    setLoading(false);
  };

  const fetchMyReviews = async () => {
    if (!user) return;
    const { data } = await supabase.from("reviews").select("session_id").eq("reviewer_id", user.id);
    if (data) setReviewedSessionIds(new Set(data.map((r) => r.session_id)));
  };

  const updateStatus = async (id: string, status: "accepted" | "declined") => {
    if (!user) return;
    try {
      const { error } = await supabase.from("tfp_requests").update({ status }).eq("id", id);
      if (error) throw error;

      // Find the request to get sender/receiver info
      const request = requests.find(r => r.id === id);
      if (!request) { toast.success(t.dashboard.requestStatusFallback(status)); fetchRequests(); return; }

      const partnerId = request.sender_id === user.id ? request.receiver_id : request.sender_id;
      const partnerProfile = request.sender_id === user.id ? request.receiver : request.sender;

      const senderName = profile?.name || "Someone";

      if (status === "accepted") {
        // Create session — location nullable; Sessions.tsx renders the TBD fallback.
        const { data: newSession } = await supabase
          .from("sessions")
          .insert({
            photographer_id: request.sender_id,
            model_id: request.receiver_id,
            date: request.proposed_date || new Date().toISOString().split("T")[0],
            location: request.proposed_location || null,
            status: "upcoming" as any,
            request_id: request.id,
          })
          .select("id")
          .single();

        if (newSession) {
          await supabase.from("tfp_requests").update({ session_id: newSession.id }).eq("id", id);
        }

        // Create or find conversation
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(user1_id.eq.${user.id},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${user.id})`)
          .maybeSingle();

        if (!existingConv) {
          await supabase.from("conversations").insert({ user1_id: user.id, user2_id: partnerId });
        }

        // Notify sender their request was accepted — kind+params drives the
        // localized render in Notifications.tsx; legacy title/body kept as
        // fallback for any consumer that hasn't migrated yet.
        const tfpAccepted = t.notifs.tfp_request_accepted({ name: senderName });
        await supabase.from("notifications").insert({
          user_id: partnerId,
          type: "tfp_request",
          kind: "tfp_request_accepted",
          params: { name: senderName },
          title: tfpAccepted.title,
          body: tfpAccepted.body,
          data: { sender_id: user.id },
        });
      } else {
        // Notify sender their request was declined
        const tfpDeclined = t.notifs.tfp_request_declined({ name: senderName });
        await supabase.from("notifications").insert({
          user_id: partnerId,
          type: "tfp_request",
          kind: "tfp_request_declined",
          params: { name: senderName },
          title: tfpDeclined.title,
          body: tfpDeclined.body,
          data: { sender_id: user.id },
        });
      }

      toast.success(status === "accepted" ? t.dashboard.acceptedWithSession : t.dashboard.declinedToast);
      fetchRequests();
    } catch {
      toast.error(t.dashboard.requestActionFailed);
    }
  };

  const handleReview = async (r: TfpRequest, partnerName: string) => {
    if (!user) return;
    let sessionId = r.session_id;
    if (!sessionId) {
      const { data: newSession, error } = await supabase
        .from("sessions")
        .insert({
          photographer_id: r.sender_id,
          model_id: r.receiver_id,
          date: r.proposed_date || new Date().toISOString().split("T")[0],
          location: r.proposed_location || "Not specified",
          status: "completed" as const,
          request_id: r.id,
        })
        .select()
        .single();
      if (error || !newSession) { toast.error(t.dashboard.reviewSessionFailed); return; }
      sessionId = newSession.id;
      await supabase.from("tfp_requests").update({ session_id: sessionId }).eq("id", r.id);
    }
    const partnerId = r.sender_id === user.id ? r.receiver_id : r.sender_id;
    setReviewTarget({ sessionId, partnerId, partnerName });
  };

  const filtered = requests.filter((r) =>
    tab === "received" ? r.receiver_id === user?.id : r.sender_id === user?.id
  );

  const stats = {
    received: requests.filter((r) => r.receiver_id === user?.id).length,
    sent: requests.filter((r) => r.sender_id === user?.id).length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    completed: requests.filter((r) => r.status === "completed" || r.status === "counter").length,
  };

  const pendingReceived = requests.filter((r) => r.receiver_id === user?.id && r.status === "pending").length;
  const pendingSent = requests.filter((r) => r.sender_id === user?.id && r.status === "pending").length;
  const firstName = profile?.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Welcome Header ── */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary font-heading">
                    {firstName.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="font-body text-sm text-muted-foreground">{getGreeting()}</p>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{firstName}</h1>
              </div>
            </div>
            {/* Quick Actions — desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate("/discover")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-body text-sm font-medium hover:border-primary/30 transition-all group">
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                {t.dashboard.discoverCreatives}
              </button>
              <button onClick={() => navigate("/castings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity">
                <Megaphone className="w-4 h-4" />
                {t.dashboard.newCasting}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className={isDesktop ? "grid grid-cols-[1fr_340px] gap-8" : "flex flex-col gap-6"}>

          {/* ═══ LEFT COLUMN: TFP Requests ═══ */}
          <div>
            {/* Tabs with counters */}
            <div className="flex items-center gap-2 mb-5">
              {(["received", "sent"] as const).map((tabKey) => {
                const active = tab === tabKey;
                const count = tabKey === "received" ? stats.received : stats.sent;
                const pendingCount = tabKey === "received" ? pendingReceived : pendingSent;
                return (
                  <button key={tabKey} onClick={() => setTab(tabKey)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-sm transition-all ${
                      active
                        ? "gold-gradient text-primary-foreground font-semibold shadow-lg shadow-primary/15"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}>
                    {tabKey === "received" ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    {tabKey === "received" ? t.dashboard.received : t.dashboard.sent}
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{count}</span>
                    {pendingCount > 0 && !active && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-warning text-[10px] font-bold text-primary-foreground flex items-center justify-center">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Request List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 px-4 bg-card/30 border border-border rounded-2xl">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{t.dashboard.noRequests}</h3>
                <p className="font-body text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{t.dashboard.noRequestsSub}</p>
                <button onClick={() => navigate("/discover")} className="px-6 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  {t.dashboard.discoverCreatives} <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r, i) => {
                  const partner = tab === "received" ? r.sender : r.receiver;
                  const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  const canReview = (r.status === "accepted" || r.status === "completed") && !(r.session_id && reviewedSessionIds.has(r.session_id));
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-[0_8px_32px_hsl(37_42%_60%/0.06)] group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/30 transition-colors flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/profile/${tab === "received" ? r.sender_id : r.receiver_id}`)}>
                          {partner?.avatar_url ? (
                            <img src={partner.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{partner?.name?.charAt(0) || "?"}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-heading text-sm font-bold text-foreground">{partner?.name}</p>
                            <span className={`${st.bg} ${st.color} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                            {r.style && <span className="text-[10px] font-body text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.style}</span>}
                          </div>
                          {r.message && <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-2">"{r.message}"</p>}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-body">
                            {r.proposed_date && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{format(new Date(r.proposed_date), "MMM d")}</span>}
                            {r.proposed_location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{r.proposed_location}</span>}
                            {r.created_at && <span>{format(new Date(r.created_at), "MMM d, yyyy")}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pl-16">
                        {tab === "received" && r.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(r.id, "accepted")} className="flex-1 gold-gradient py-2.5 rounded-xl font-body text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> {t.dashboard.accept}
                            </button>
                            <button onClick={() => updateStatus(r.id, "declined")} className="flex-1 bg-destructive/10 text-destructive py-2.5 rounded-xl font-body text-xs font-semibold hover:bg-destructive/20 transition-colors inline-flex items-center justify-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> {t.dashboard.decline}
                            </button>
                            <button onClick={() => navigate("/messages")} className="px-3.5 bg-card border border-border py-2.5 rounded-xl hover:border-primary/30 transition-colors">
                              <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        )}
                        {tab === "sent" && r.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(r.id, "declined")} className="flex-1 bg-destructive/10 text-destructive py-2.5 rounded-xl font-body text-xs font-semibold hover:bg-destructive/20 transition-colors inline-flex items-center justify-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> {t.common.cancel}
                            </button>
                            <button onClick={() => navigate("/messages")} className="px-3.5 bg-card border border-border py-2.5 rounded-xl hover:border-primary/30 transition-colors">
                              <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        )}
                        {canReview && (
                          <button onClick={() => handleReview(r, partner?.name || "")} className="flex-1 gold-gradient py-2.5 rounded-xl font-body text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1.5">
                            <Star className="w-3.5 h-3.5" /> {t.dashboard.leaveReview}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN (desktop) / BELOW (mobile) ═══ */}
          <div className="space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.dashboard.received, value: stats.received, icon: Clock, accent: false },
                { label: t.dashboard.sent, value: stats.sent, icon: Send, accent: false },
                { label: t.dashboard.accepted, value: stats.accepted, icon: CheckCircle, accent: true },
                { label: t.dashboard.completed, value: stats.completed, icon: Star, accent: true },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                    className={`rounded-2xl p-4 border transition-all hover:border-primary/30 ${s.accent ? "bg-primary/5 border-primary/15" : "bg-card border-border"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.accent ? "gold-gradient" : "bg-foreground/[0.05]"}`}>
                        <Icon className={`w-[18px] h-[18px] ${s.accent ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                    <p className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                    <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions — mobile */}
            <div className="md:hidden flex gap-2">
              <button onClick={() => navigate("/discover")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-foreground font-body text-sm font-medium hover:border-primary/30 transition-all">
                <Search className="w-4 h-4 text-primary" /> {t.nav.discover}
              </button>
              <button onClick={() => navigate("/castings")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl gold-gradient text-primary-foreground font-body text-sm font-semibold">
                <Megaphone className="w-4 h-4" /> {t.dashboard.newCasting}
              </button>
            </div>

            {/* Pending Alert */}
            {pendingReceived > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{t.dashboard.pendingHeader(pendingReceived)}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.dashboard.pendingSub}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* My Castings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  <h2 className="font-heading text-sm font-bold text-foreground">{t.dashboard.myCastings}</h2>
                </div>
                <button onClick={() => navigate("/castings")} className="text-[11px] font-body text-primary hover:underline inline-flex items-center gap-0.5">
                  {t.cta.seeAll} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <MyCastingsSection />
            </div>

            {/* Pro Upgrade Card */}
            {profile?.plan === "free" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => navigate("/pro")}
                className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{t.dashboard.proUpgradeTitle}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.dashboard.proUpgradeSub}</p>
                  </div>
                </div>
                <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                  {t.dashboard.proUpgradeBody}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          open={!!reviewTarget}
          onClose={() => { setReviewTarget(null); fetchMyReviews(); }}
          sessionId={reviewTarget.sessionId}
          partnerId={reviewTarget.partnerId}
          partnerName={reviewTarget.partnerName}
        />
      )}
    </div>
  );
}
