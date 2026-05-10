import { useState } from "react";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  partnerId: string;
  partnerName: string;
}

export default function ReviewModal({ open, onClose, sessionId, partnerId, partnerName }: Props) {
  const { user } = useAuth();
  const t = useTranslation();

  const CATEGORIES = [
    { key: "professionalism", label: t.modals.professionalism },
    { key: "punctuality", label: t.modals.punctuality },
    { key: "communication", label: t.modals.communication },
    { key: "creativity", label: t.modals.creativity },
    { key: "result_quality", label: t.modals.quality },
  ];

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setRating = (key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const overallRating = () => {
    const p = ratings.professionalism || 0;
    const pu = ratings.punctuality || 0;
    const co = ratings.communication || 0;
    const cr = ratings.creativity || 0;
    const q = ratings.result_quality || 0;
    return Math.round((p * 0.25 + pu * 0.2 + co * 0.2 + cr * 0.2 + q * 0.15) * 10) / 10;
  };

  const handleSubmit = async () => {
    if (!user) return;
    const allRated = CATEGORIES.every((c) => ratings[c.key] && ratings[c.key] > 0);
    if (!allRated) {
      toast.error(t.modals.rateAllCategories);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        session_id: sessionId,
        reviewer_id: user.id,
        reviewed_id: partnerId,
        professionalism: ratings.professionalism,
        punctuality: ratings.punctuality,
        communication: ratings.communication,
        creativity: ratings.creativity,
        result_quality: ratings.result_quality,
        overall_rating: overallRating(),
        comment: comment || null,
        is_visible: false,
      });
      if (error) throw error;

      toast.success(t.modals.reviewSubmitted);
      onClose();
    } catch (err: any) {
      toast.error(err.message || t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold text-foreground">{t.modals.reviewTitle} — {partnerName.split(" ")[0]}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <p className="font-body text-sm text-muted-foreground mb-6">{t.modals.howWasSession} {partnerName.split(" ")[0]}?</p>

            <div className="space-y-5">
              {CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <p className="font-body text-xs text-muted-foreground mb-2">{cat.label}</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} onClick={() => setRating(cat.key, v)} className="transition-transform hover:scale-110">
                        <Star className={`w-7 h-7 transition-colors ${v <= (ratings[cat.key] || 0) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <p className="font-body text-xs text-muted-foreground mb-2">{t.modals.commentOptional}</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder={t.modals.sharePlaceholder}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:border-primary/40 transition-colors resize-none"
                />
                <p className="text-right text-[10px] text-muted-foreground mt-0.5">{comment.length}/500</p>
              </div>

              {CATEGORIES.every((c) => ratings[c.key] > 0) && (
                <div className="text-center py-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="font-body text-xs text-muted-foreground mb-1">{t.modals.overallRating}</p>
                  <p className="font-heading text-3xl font-bold gold-text">{overallRating()}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : t.modals.submitReview}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}