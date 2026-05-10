import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useDevice } from "@/hooks/useDevice";
import DesktopMessagesLayout from "@/components/messages/DesktopMessagesLayout";
import Chat from "@/pages/Chat";
import { useTranslation } from "@/hooks/useTranslation";

interface ConversationItem {
  id: string;
  other_user: {
    id: string;
    name: string;
    avatar_url: string | null;
    last_active: string | null;
  };
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
}

function isOnline(lastActive: string | null): boolean {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const { conversationId } = useParams();
  const t = useTranslation();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadConversations = async () => {
    if (!user) return;

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs) { setLoading(false); return; }

    const items: ConversationItem[] = [];

    for (const conv of convs) {
      const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
      const isArchived = conv.user1_id === user.id ? conv.is_archived_user1 : conv.is_archived_user2;
      if (isArchived) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, last_active")
        .eq("id", otherId)
        .single();

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      items.push({
        id: conv.id,
        other_user: profile || { id: otherId, name: "Unknown", avatar_url: null, last_active: null },
        last_message_preview: conv.last_message_preview,
        last_message_at: conv.last_message_at,
        unread_count: count || 0,
      });
    }

    setConversations(items);
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => { loadConversations(); }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { loadConversations(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (isDesktop) {
    return <DesktopMessagesLayout />;
  }

  if (conversationId) {
    return <Chat />;
  }

  const filtered = conversations.filter((c) =>
    c.other_user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t.messages.title}</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.messages.typeMessage}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="font-heading text-lg font-semibold text-foreground">{t.messages.noMessages}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {t.messages.noMessagesSub}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-card/60 transition-colors text-left border-b border-border/30"
              >
                <div className="relative flex-shrink-0">
                  {conv.other_user.avatar_url ? (
                    <img src={conv.other_user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-heading text-lg">
                      {conv.other_user.name.charAt(0)}
                    </div>
                  )}
                  {isOnline(conv.other_user.last_active) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-body text-sm truncate ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {conv.other_user.name}
                    </p>
                    <span className="font-body text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                      {conv.last_message_at
                        ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`font-body text-xs truncate ${conv.unread_count > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {conv.last_message_preview || t.messages.noMessages}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
