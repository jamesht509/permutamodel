import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Users, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import ApplicationsModal from "@/components/castings/ApplicationsModal";

interface MyCasting {
  id: string;
  title: string;
  status: string;
  slots: number;
  filled_slots: number | null;
  created_at: string | null;
  applicationCount: number;
}

export default function MyCastingsSection() {
  const { user } = useAuth();
  const [castings, setCastings] = useState<MyCasting[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageTarget, setManageTarget] = useState<string | null>(null);

  const fetchMyCastings = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("casting_calls")
      .select("id, title, status, slots, filled_slots, created_at")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) { setCastings([]); setLoading(false); return; }

    const castingIds = data.map((c) => c.id);
    const { data: apps } = await supabase
      .from("applications")
      .select("casting_id")
      .in("casting_id", castingIds);

    const countMap = new Map<string, number>();
    apps?.forEach((a) => countMap.set(a.casting_id, (countMap.get(a.casting_id) || 0) + 1));

    setCastings(data.map((c) => ({
      ...c,
      applicationCount: countMap.get(c.id) || 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchMyCastings(); }, [user]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (castings.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-card/30 border border-border rounded-xl">
        <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground">No castings created yet</p>
      </div>
    );
  }

  const STATUS_STYLE: Record<string, string> = {
    open: "bg-green-500/15 text-green-400",
    filled: "bg-primary/15 text-primary",
    expired: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <>
      <div className="space-y-2">
        {castings.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setManageTarget(c.id)}
            className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-bold text-foreground truncate">{c.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-semibold ${STATUS_STYLE[c.status] || STATUS_STYLE.expired}`}>
                  {c.status}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-body text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {c.applicationCount} applied • {c.filled_slots || 0}/{c.slots} filled
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {manageTarget && (
        <ApplicationsModal castingId={manageTarget} onClose={() => setManageTarget(null)} onUpdate={fetchMyCastings} />
      )}
    </>
  );
}
