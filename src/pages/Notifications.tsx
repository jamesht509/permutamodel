import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, Camera, Star, MessageCircle, Clapperboard, ClipboardList, CalendarDays, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string | null;
  data: any;
  grouped?: Notif[];
}

const groupNotifications = (notifs: Notif[]): Notif[] => {
  const grouped: Record<string, Notif[]> = {};
  notifs.forEach((n) => {
    const day = n.created_at ? n.created_at.split("T")[0] : "unknown";
    const key = `${n.type}_${day}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });
  return Object.values(grouped).map((items) => {
    if (items.length === 1) return items[0];
    return {
      ...items[0],
      title: `${items.length} ${items[0].type.replace(/_/g, " ")}s`,
      body: `${items.length} new ${items[0].type.replace(/_/g, " ")}s`,
      read: items.every((i) => i.read),
      grouped: items,
    };
  });
};

const TYPE_ICONS: Record<string, { icon: any; bg: string; color: string }> = {
  tfp_request: { icon: Camera, bg: "bg-primary/10", color: "text-primary" },
  tfp_accepted: { icon: Camera, bg: "bg-success/10", color: "text-[hsl(var(--success))]" },
  review: { icon: Star, bg: "bg-warning/10", color: "text-warning" },
  message: { icon: MessageCircle, bg: "bg-primary/10", color: "text-primary" },
  casting: { icon: Clapperboard, bg: "bg-secondary/20", color: "text-secondary-foreground" },
  application: { icon: ClipboardList, bg: "bg-primary/10", color: "text-primary" },
  application_accepted: { icon: ClipboardList, bg: "bg-success/10", color: "text-[hsl(var(--success))]" },
  application_declined: { icon: ClipboardList, bg: "bg-destructive/10", color: "text-destructive" },
  session: { icon: CalendarDays, bg: "bg-primary/10", color: "text-primary" },
  favorite: { icon: Heart, bg: "bg-primary/10", color: "text-primary" },
};
const DEFAULT_ICON = { icon: Bell, bg: "bg-muted", color: "text-muted-foreground" };

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t.modals.justNow;
    if (mins < 60) return `${mins}${t.common.minutes} ${t.common.ago}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t.common.hours} ${t.common.ago}`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}${t.common.days} ${t.common.ago}`;
    return new Date(dateStr).toLocaleDateString();
  }

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifications((data as Notif[]) || []);
        setLoading(false);
      });
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t.notifications.markAllRead);
  };

  const tapNotification = async (notif: Notif) => {
    if (!notif.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
    const d = notif.data || {};
    if (notif.type === "tfp_request" && d.sender_id) navigate(`/profile/${d.sender_id}`);
    else if (notif.type === "message" && d.conversation_id) navigate(`/messages/${d.conversation_id}`);
    else if (notif.type === "casting" && d.casting_id) navigate("/castings");
    else if (notif.type === "application") navigate("/castings");
  };

  const grouped = groupNotifications(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-heading text-lg font-bold text-foreground">{t.notifications.title}</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-body font-bold">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-body text-primary hover:text-primary/80">
              <CheckCheck className="w-3.5 h-3.5" /> {t.notifications.markAllRead}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Bell className="w-10 h-10 text-primary" />
            </div>
            <p className="font-heading text-lg text-foreground">{t.notifications.noNotifications}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">{t.notifications.noNotificationsSub}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {grouped.map((n, i) => {
              const typeConfig = TYPE_ICONS[n.type] || DEFAULT_ICON;
              const Icon = typeConfig.icon;
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => tapNotification(n)}
                  className={`w-full text-left px-4 py-4 flex gap-3.5 transition-colors hover:bg-card/50 ${!n.read ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    {n.grouped ? (
                      <span className="text-sm font-heading font-bold text-primary">{n.grouped.length}</span>
                    ) : (
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.title}</p>
                    {n.body && <p className="text-xs font-body text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] font-body text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}