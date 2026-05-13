import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, ShieldBan, ShieldCheck, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  type: string;
  metadata: any;
  read_at: string | null;
  created_at: string | null;
}

interface OtherUser {
  id: string;
  name: string;
  avatar_url: string | null;
  last_active: string | null;
}

interface TfpInfo {
  title: string;
  status: string;
  style: string | null;
}

function isOnline(lastActive: string | null): boolean {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();

  const formatDayLabel = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isToday(d)) return t.common.today;
    if (isYesterday(d)) return t.common.yesterday;
    return format(d, "MMMM d, yyyy");
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [tfpInfo, setTfpInfo] = useState<TfpInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByThem, setBlockedByThem] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation data
  useEffect(() => {
    if (!conversationId || !user) return;

    const load = async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (!conv) { navigate("/messages"); return; }

      const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, last_active")
        .eq("id", otherId)
        .single();

      if (profile) setOtherUser(profile);

      // Check block status
      const { data: myBlock } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", otherId)
        .maybeSingle();
      setIsBlocked(!!myBlock);

      // Check if they blocked us (using the is_blocked function indirectly - try sending)
      const { data: theirBlock } = await supabase
        .rpc("is_blocked", { user1: otherId, user2: user.id });
      // If they blocked us but we didn't block them
      setBlockedByThem(!myBlock && !!theirBlock);

      // Check for TFP request between users
      const { data: tfpReq } = await supabase
        .from("tfp_requests")
        .select("message, status, style")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tfpReq) {
        setTfpInfo({
          title: tfpReq.message?.split("\n")[0] || t.chatPage.tfpFallbackTitle,
          status: tfpReq.status,
          style: tfpReq.style,
        });
      }

      // Get messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setLoading(false);

      // Mark unread as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null);
    };

    load();
  }, [conversationId, user, navigate]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== user.id) {
            supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMsg.id).then();
          }
        }
      )
      .subscribe();

    // Typing presence channel
    const presenceChannel = supabase
      .channel(`typing-${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, user]);

  const broadcastTyping = () => {
    if (!conversationId || !user) return;
    supabase.channel(`typing-${conversationId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  };

  const handleBlock = async () => {
    if (!user || !otherUser) return;
    if (isBlocked) {
      await supabase.from("blocked_users").delete().eq("blocker_id", user.id).eq("blocked_id", otherUser.id);
      setIsBlocked(false);
      setShowMenu(false);
      toast.success(t.chatPage.unblockedToast(otherUser.name));
    } else {
      await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: otherUser.id });
      setIsBlocked(true);
      setShowMenu(false);
      toast.success(t.chatPage.blockedToast(otherUser.name));
    }
  };

  const chatBlocked = isBlocked || blockedByThem;

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim() || chatBlocked) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      type: "text",
      metadata: {},
    });

    if (error) {
      if (error.message?.includes("row-level security")) {
        toast.error(t.chatPage.cannotMessage);
      } else {
        toast.error(t.chatPage.sendFailed);
      }
    } else {
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.trim().slice(0, 100),
        })
        .eq("id", conversationId);
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  // Group messages by day
  const groupedMessages: { label: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = msg.created_at ? new Date(msg.created_at) : new Date();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.msgs[0]?.created_at && isSameDay(new Date(lastGroup.msgs[0].created_at), date)) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ label: formatDayLabel(msg.created_at || new Date().toISOString()), msgs: [msg] });
    }
  });

  const statusColor: Record<string, string> = {
    pending: "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]",
    accepted: "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]",
    declined: "bg-destructive/20 text-destructive",
    counter: "bg-primary/20 text-primary",
  };

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3 h-[60vh]">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl animate-pulse ${i % 2 === 0 ? "bg-primary/20" : "bg-muted"}`}>
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100vh-0rem)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border z-10">
        <button onClick={() => navigate("/messages")} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative cursor-pointer" onClick={() => otherUser && navigate(`/profile/${otherUser.id}`)}>
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-heading">
              {otherUser?.name.charAt(0) || "?"}
            </div>
          )}
          {otherUser && isOnline(otherUser.last_active) && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[hsl(var(--success))] rounded-full border-2 border-card" />
          )}
        </div>
        <div className="flex-1 cursor-pointer" onClick={() => otherUser && navigate(`/profile/${otherUser.id}`)}>
          <p className="font-body font-semibold text-sm text-foreground">{otherUser?.name || t.chatPage.unknownUser}</p>
          <p className="font-body text-[10px] text-muted-foreground">
            {isTyping ? (
              <span className="text-primary animate-pulse">{t.chatPage.typingIndicator}</span>
            ) : otherUser && isOnline(otherUser.last_active) ? t.messages.online : t.messages.offline}
          </p>
        </div>
        {/* Block menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 min-w-[160px]">
              <button
                onClick={handleBlock}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-body transition-colors ${
                  isBlocked
                    ? "text-foreground hover:bg-muted"
                    : "text-destructive hover:bg-destructive/10"
                }`}
              >
                {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                {isBlocked ? t.chatPage.unblock : t.chatPage.blockUser}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TFP Banner */}
      {tfpInfo && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
          <span className="font-body text-xs font-medium text-primary inline-flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> {t.chatPage.tfpBannerLabel}: {tfpInfo.style || t.chatPage.tfpFallbackTitle}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[tfpInfo.status] || "bg-muted text-muted-foreground"}`}>
            {tfpInfo.status.toUpperCase()}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            {/* Day separator */}
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] font-body text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {group.label}
              </span>
            </div>
            {group.msgs.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const isSystem = msg.type === "system";

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[11px] font-body text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
                  <div className="max-w-[75%]">
                    <div
                      className={`px-4 py-2.5 text-sm font-body leading-relaxed ${
                        isMine
                          ? "bg-primary/15 border border-primary/10 text-foreground rounded-2xl rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className={`text-[10px] font-body text-muted-foreground mt-1 flex items-center gap-1 ${isMine ? "justify-end pr-1" : "pl-1"}`}>
                      {msg.created_at ? format(new Date(msg.created_at), "HH:mm") : ""}
                      {isMine && (
                        <span className={`text-[9px] ${msg.read_at ? "text-primary" : "text-muted-foreground/60"}`}>
                          {msg.read_at ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-1.5">
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      {chatBlocked ? (
        <div className="border-t border-border bg-card/80 backdrop-blur-xl px-4 py-4 text-center safe-area-pb">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ShieldBan className="w-4 h-4" />
            <p className="font-body text-sm">
              {isBlocked ? t.chatPage.youBlocked : t.chatPage.cannotMessage}
            </p>
          </div>
          {isBlocked && (
            <button onClick={handleBlock} className="mt-2 text-xs font-body text-primary hover:text-primary/80 transition-colors">
              {t.chatPage.unblockToContinue}
            </button>
          )}
        </div>
      ) : (
        <div className="border-t border-border bg-card/80 backdrop-blur-xl px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                broadcastTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.messages.typeMessage}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-24"
            />
            <button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || sending}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
