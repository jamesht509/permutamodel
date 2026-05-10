import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type Category = "harassment" | "fake_profile" | "noshow" | "inappropriate" | "spam" | "other";

interface Props {
  open: boolean;
  onClose: () => void;
  reportedId: string;
  reportedName: string;
}

export default function ReportModal({ open, onClose, reportedId, reportedName }: Props) {
  const { user } = useAuth();
  const t = useTranslation();

  const CATEGORIES: { value: Category; label: string; desc: string }[] = [
    { value: "harassment", label: t.modals.harassment, desc: t.modals.harassmentDesc },
    { value: "fake_profile", label: t.modals.fakeProfile, desc: t.modals.fakeProfileDesc },
    { value: "noshow", label: t.modals.noShow, desc: t.modals.noShowDesc },
    { value: "inappropriate", label: t.modals.inappropriate, desc: t.modals.inappropriateDesc },
    { value: "spam", label: t.modals.spam, desc: t.modals.spamDesc },
    { value: "other", label: t.modals.other, desc: t.modals.otherDesc },
  ];

  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !category) return;

    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportedId,
      category,
      description: description.trim() || null,
    });

    if (error) {
      toast.error(t.common.error);
    } else {
      toast.success(t.modals.submitReport);
      onClose();
      setCategory(null);
      setDescription("");
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-border max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h2 className="font-heading text-lg font-bold text-foreground">{t.modals.reportUser}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{reportedName}</span> {t.modals.reportIntro}
              </p>

              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">{t.modals.reason}</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        category === cat.value ? "border-destructive bg-destructive/10" : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <p className={`font-body text-sm font-medium ${category === cat.value ? "text-destructive" : "text-foreground"}`}>{cat.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">
                  {t.modals.detailsOptional} <span className="text-muted-foreground font-normal">({t.modals.optional})</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.modals.describePlaceholder}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-body text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-destructive/30"
                />
                <p className="text-right font-body text-[10px] text-muted-foreground">{description.length}/500</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!category || submitting}
                className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-heading text-sm font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.modals.submitting}</> : t.modals.submitReport}
              </button>

              <p className="font-body text-[10px] text-muted-foreground text-center">{t.modals.reportDisclaimer}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}