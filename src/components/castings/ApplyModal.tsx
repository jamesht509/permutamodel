import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  casting: { id: string; title: string; creator_id: string };
  onClose: () => void;
  onApplied: () => void;
}

export default function ApplyModal({ casting, onClose, onApplied }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleApply = async () => {
    if (!user) return;
    setSending(true);

    const { error } = await supabase.from("applications").insert({
      casting_id: casting.id,
      applicant_id: user.id,
      message: message || null,
    });

    if (error) {
      if (error.code === "23505") toast.error("Already applied");
      else toast.error(error.message);
    } else {
      // Notify creator
      await supabase.from("notifications").insert({
        user_id: casting.creator_id,
        type: "application",
        title: "New Application",
        body: `Someone applied to "${casting.title}"`,
        data: { casting_id: casting.id, applicant_id: user.id },
      });
      toast.success("Application sent! 🎉");
      onApplied();
      onClose();
    }
    setSending(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Apply to Casting</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <p className="font-body text-sm text-muted-foreground mb-4">{casting.title}</p>

        <label className="block text-xs font-body text-muted-foreground mb-1">Why should they pick you?</label>
        <textarea
          value={message}
          onChange={(e) => { if (e.target.value.length <= 500) setMessage(e.target.value); }}
          rows={4}
          placeholder="Tell them about your experience and why you're a great fit..."
          className="w-full px-3 py-2.5 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-right text-[10px] text-muted-foreground mt-0.5 mb-4">{message.length}/500</p>

        <button onClick={handleApply} disabled={sending} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50">
          {sending ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit Application</>}
        </button>
      </motion.div>
    </motion.div>
  );
}
