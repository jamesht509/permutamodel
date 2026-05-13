import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

export default function AvailabilityToggle() {
  const { user, profile, refreshProfile } = useAuth();
  const t = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState<"today" | "3days" | "week">("today");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || !profile) return null;

  const isAvailable = (profile as any).available_now;

  const handleToggleOff = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        available_now: false,
        available_until: null,
        availability_note: null,
      } as any)
      .eq("id", user.id);

    if (error) {
      toast.error(t.availability.updateFailed);
    } else {
      toast.success(t.availability.turnedOff);
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleActivate = async () => {
    setSaving(true);
    const now = new Date();
    let expiresAt: Date;

    if (duration === "today") {
      expiresAt = new Date(now);
      expiresAt.setHours(23, 59, 59, 999);
    } else if (duration === "3days") {
      expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    } else {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        available_now: true,
        available_until: expiresAt.toISOString(),
        availability_note: note.trim() || null,
      } as any)
      .eq("id", user.id);

    if (error) {
      toast.error(t.availability.activateFailed);
    } else {
      toast.success(t.availability.activated);
      await refreshProfile();
      setShowModal(false);
      setNote("");
    }
    setSaving(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isAvailable ? handleToggleOff : () => setShowModal(true)}
        disabled={saving}
        className={`w-full py-3.5 rounded-xl font-body font-semibold text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 ${
          isAvailable
            ? "bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10"
            : "bg-card/50 border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        {isAvailable ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            {t.discover.availableNow}
            <span className="text-primary/60 text-xs font-normal">· {t.availability.tapToDisable}</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            {t.availability.setAsAvailable}
          </>
        )}
      </motion.button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground">{t.availability.setAvailability}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-body text-sm text-muted-foreground mb-4">
              {t.availability.intro}
            </p>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-body text-muted-foreground">{t.availability.howLong}</label>
              <div className="flex gap-2">
                {([
                  { value: "today", label: t.availability.today },
                  { value: "3days", label: t.availability.threeDays },
                  { value: "week", label: t.availability.oneWeek },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-body font-medium transition-all ${
                      duration === opt.value
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                        : "bg-card/50 text-muted-foreground border border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-body text-muted-foreground mb-1.5 block">
                {t.availability.detailsLabel}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 120))}
                placeholder={t.availability.detailsPlaceholder}
                className="w-full h-20 bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{note.length}/120</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body font-medium"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleActivate}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-body font-semibold disabled:opacity-50"
              >
                {saving ? t.availability.activating : t.availability.activate}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
