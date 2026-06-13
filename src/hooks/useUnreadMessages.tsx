import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Global unread-message count for the current user, used by the bottom-nav
// / sidebar badge. Counts messages the user received (sender_id != self)
// that haven't been read (read_at is null). RLS already scopes the query to
// the user's own conversations.
//
// Realtime: a single channel filtered server-side to sender_id != self
// covers both directions — an INSERT of an incoming message bumps the
// count, and an UPDATE flipping read_at to a timestamp (the user opening
// the thread) clears it. The filter keeps us from refetching on the user's
// own outgoing messages.
//
// This is intentionally the *global* count. Per-conversation unread badges
// (DesktopMessagesLayout) stay separate — they scope by conversation_id.
export function useUnreadMessages(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const fetchUnread = async () => {
      const { count: c } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setCount(c || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=neq.${user.id}` },
        fetchUnread,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=neq.${user.id}` },
        fetchUnread,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}
