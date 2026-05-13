import { useState, useEffect } from "react";
import { X, Check, XCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface Application {
  id: string;
  applicant_id: string;
  message: string | null;
  status: string;
  created_at: string | null;
  applicant: { name: string; avatar_url: string | null; rating_avg: number | null; styles: string[] | null } | null;
}

interface Props { castingId: string; onClose: () => void; onUpdate: () => void; }

export default function ApplicationsModal({ castingId, onClose, onUpdate }: Props) {
  const { user } = useAuth();
  const t = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("casting_id", castingId)
        .order("created_at", { ascending: false });

      if (!apps) { setLoading(false); return; }

      const ids = apps.map((a) => a.applicant_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, rating_avg, styles")
        .in("id", ids);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      setApplications(apps.map((a) => ({ ...a, applicant: profileMap.get(a.applicant_id) || null })));
      setLoading(false);
    };
    load();
  }, [castingId]);

  const handleAction = async (appId: string, applicantId: string, action: "accepted" | "declined") => {
    const { error } = await supabase.from("applications").update({ status: action }).eq("id", appId);
    if (error) { toast.error(error.message); return; }

    // Cached title so both branches can pass it into the notif params.
    let castingTitleForNotif: string | undefined;

    if (action === "accepted" && user) {
      // Get casting details for session creation
      const { data: casting } = await supabase.from("casting_calls").select("*").eq("id", castingId).single();
      castingTitleForNotif = casting?.title;
      
      if (casting) {
        // Update filled_slots
        const newFilled = (casting.filled_slots || 0) + 1;
        await supabase.from("casting_calls").update({
          filled_slots: newFilled,
          ...(newFilled >= casting.slots ? { status: "filled" as any } : {}),
        }).eq("id", castingId);

        // Determine photographer/model based on actual roles
        const { data: roleProfiles } = await supabase
          .from("profiles")
          .select("id, role")
          .in("id", [casting.creator_id, applicantId]);

        const roleMap = new Map(roleProfiles?.map((p) => [p.id, p.role]) || []);
        const creatorRole = roleMap.get(casting.creator_id);
        const applicantRole = roleMap.get(applicantId);

        // Assign: if creator is photographer (or dual), they're the photographer.
        // Otherwise, the applicant is the photographer.
        let photographerId: string;
        let modelId: string;

        if (creatorRole === "photographer" || creatorRole === "dual") {
          photographerId = casting.creator_id;
          modelId = applicantId;
        } else if (applicantRole === "photographer" || applicantRole === "dual") {
          photographerId = applicantId;
          modelId = casting.creator_id;
        } else {
          // Fallback: creator as photographer
          photographerId = casting.creator_id;
          modelId = applicantId;
        }

        // Auto-create session — location nullable; UI renders fallback.
        await supabase.from("sessions").insert({
          photographer_id: photographerId,
          model_id: modelId,
          date: casting.proposed_date || new Date().toISOString().split("T")[0],
          location: casting.location || null,
          status: "confirmed" as const,
          request_id: null,
        });
      }

      // Create conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${applicantId}),and(user1_id.eq.${applicantId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (!existing) {
        await supabase.from("conversations").insert({ user1_id: user.id, user2_id: applicantId });
      }

      // Notify applicant — kind+params for localized render, legacy
      // title/body kept as fallback.
      const appAccepted = t.notifs.application_accepted({ castingTitle: castingTitleForNotif });
      await supabase.from("notifications").insert({
        user_id: applicantId,
        type: "application_accepted",
        kind: "application_accepted",
        params: { castingTitle: castingTitleForNotif },
        title: appAccepted.title,
        body: appAccepted.body,
        data: { casting_id: castingId },
      });

      toast.success("Applicant accepted! Session created.");
    } else if (action === "declined") {
      // Fetch casting title for the declined notif (no session created here)
      if (!castingTitleForNotif) {
        const { data: castingMeta } = await supabase
          .from("casting_calls")
          .select("title")
          .eq("id", castingId)
          .maybeSingle();
        castingTitleForNotif = castingMeta?.title;
      }
      const appDeclined = t.notifs.application_declined({ castingTitle: castingTitleForNotif });
      await supabase.from("notifications").insert({
        user_id: applicantId,
        type: "application_declined",
        kind: "application_declined",
        params: { castingTitle: castingTitleForNotif },
        title: appDeclined.title,
        body: appDeclined.body,
        data: { casting_id: castingId },
      });
      toast.info("Application declined");
    }

    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: action } : a));
    onUpdate();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Applications ({applications.length})</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : applications.length === 0 ? (
          <p className="text-center font-body text-sm text-muted-foreground py-8">No applications yet</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="p-3 rounded-xl bg-card/50 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  {app.applicant?.avatar_url ? (
                    <img src={app.applicant.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {app.applicant?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-body font-semibold text-sm text-foreground">{app.applicant?.name || "Unknown"}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-xs font-body text-muted-foreground">{Number(app.applicant?.rating_avg || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-semibold capitalize ${
                    app.status === "accepted" ? "bg-green-500/15 text-green-400" :
                    app.status === "declined" ? "bg-destructive/15 text-destructive" :
                    "bg-primary/15 text-primary"
                  }`}>{app.status}</span>
                </div>

                {app.applicant?.styles && app.applicant.styles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {app.applicant.styles.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary">{s}</span>
                    ))}
                  </div>
                )}

                {app.message && <p className="font-body text-xs text-muted-foreground mb-3">{app.message}</p>}

                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(app.id, app.applicant_id, "accepted")} className="flex-1 py-2 rounded-xl bg-green-500/15 text-green-400 text-xs font-body font-semibold flex items-center justify-center gap-1 hover:bg-green-500/25 transition-colors">
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => handleAction(app.id, app.applicant_id, "declined")} className="flex-1 py-2 rounded-xl bg-destructive/15 text-destructive text-xs font-body font-semibold flex items-center justify-center gap-1 hover:bg-destructive/25 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
