import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import Chat from "@/pages/Chat";

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

export default function DesktopMessagesLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
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
      .channel("desktop-conversations-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => loadConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => loadConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filtered = conversations.filter((c) =>
    c.other_user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100dvh-2rem)] flex overflow-hidden rounded-2xl border border-border bg-card/10">
      {/* Conversation List */}
      <aside className="w-[340px] border-r border-border bg-background/80 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-heading text-lg font-bold text-foreground mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-full bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-2.5 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="font-heading text-sm font-semibold text-foreground">No conversations yet</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Start a conversation from someone's profile</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const active = conversationId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left ${
                    active
                      ? "bg-primary/[0.08] border-l-2 border-l-primary"
                      : "border-l-2 border-l-transparent hover:bg-foreground/[0.03]"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.other_user.avatar_url ? (
                      <img src={conv.other_user.avatar_url} alt="" className={`w-11 h-11 rounded-full object-cover border-2 ${active ? "border-primary/30" : "border-transparent"}`} />
                    ) : (
                      <div className={`w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-heading ${active ? "ring-2 ring-primary/20" : ""}`}>
                        {conv.other_user.name.charAt(0)}
                      </div>
                    )}
                    {isOnline(conv.other_user.last_active) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-body text-sm truncate ${conv.unread_count > 0 ? "font-bold text-foreground" : active ? "font-medium text-foreground" : "font-medium text-foreground/80"}`}>
                        {conv.other_user.name}
                      </p>
                      <span className={`font-body text-[10px] flex-shrink-0 ml-2 ${conv.unread_count > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`font-body text-xs truncate ${conv.unread_count > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                        {conv.last_message_preview || "No messages yet"}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 rounded-full gold-gradient text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {conversationId ? (
          <Chat />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-10 h-10 text-primary/40" />
              </div>
              <p className="font-heading text-lg font-bold text-foreground">Select a conversation</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
