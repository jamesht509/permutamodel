// Mobile filters bottom sheet — replaces the desktop sidebar on
// viewports < lg. Slides up from the bottom, max-height 70vh, scrollable
// body, sticky CTA at the bottom.
//
// State is local until "Aplicar" is tapped — the parent only learns about
// changes through onApply(filters). "Limpar" resets in place and keeps
// the sheet open. Tap on the backdrop or pressing ESC closes without
// applying.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface FilterValues {
  styles: string[];
  radius: number;
  rating: number;
}

interface FiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterValues;
  onApply: (filters: FilterValues) => void;
  /** Available style chips, brand-aware label list. Caller decides ordering. */
  styleOptions: string[];
}

const DEFAULT_FILTERS: FilterValues = { styles: [], radius: 50, rating: 0 };

export default function FiltersSheet({
  isOpen,
  onClose,
  currentFilters,
  onApply,
  styleOptions,
}: FiltersSheetProps) {
  const t = useTranslation();
  const labels = t.filtersSheet;

  const [draft, setDraft] = useState<FilterValues>(currentFilters);

  // Sync draft when sheet opens — picks up external changes.
  useEffect(() => {
    if (isOpen) setDraft(currentFilters);
  }, [isOpen, currentFilters]);

  // ESC closes.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const toggleStyle = (s: string) => {
    setDraft((d) => ({
      ...d,
      styles: d.styles.includes(s) ? d.styles.filter((x) => x !== s) : [...d.styles, s],
    }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[70vh] flex flex-col safe-area-pb"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-9 h-1 rounded-full bg-ink-tertiary/50" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <h2 className="font-display text-base font-medium text-ink">{labels.title}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDraft(DEFAULT_FILTERS)}
                  className="text-sm text-ink-secondary active:scale-95 transition-transform min-h-[44px] px-2"
                >
                  {labels.clear}
                </button>
                <button
                  onClick={onClose}
                  aria-label={labels.close}
                  className="w-10 h-10 flex items-center justify-center text-ink-secondary active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-6">
              {/* Styles */}
              <section>
                <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-3">
                  {labels.styles}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((s) => {
                    const selected = draft.styles.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`px-3 py-2 rounded-full text-sm transition-all active:scale-95 ${
                          selected
                            ? "bg-coral text-on-coral font-medium"
                            : "bg-elevated text-ink-secondary"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Radius */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider">
                    {labels.radius}
                  </h3>
                  <span className="text-sm text-ink">
                    {draft.radius >= 200 ? labels.anyDistance : `${draft.radius} km`}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={draft.radius}
                  onChange={(e) => setDraft((d) => ({ ...d, radius: Number(e.target.value) }))}
                  className="w-full accent-coral"
                  aria-label={labels.radius}
                />
              </section>

              {/* Rating */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider">
                    {labels.rating}
                  </h3>
                  <span className="text-sm text-ink">
                    {draft.rating === 0 ? labels.anyRating : `${draft.rating.toFixed(1)} ★`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={draft.rating}
                  onChange={(e) => setDraft((d) => ({ ...d, rating: Number(e.target.value) }))}
                  className="w-full accent-coral"
                  aria-label={labels.rating}
                />
              </section>
            </div>

            {/* Sticky apply CTA */}
            <div className="px-5 pt-3 pb-2 border-t border-strong shrink-0">
              <button
                onClick={handleApply}
                className="w-full py-3.5 rounded-xl bg-coral text-on-coral text-sm font-medium active:scale-[0.98] transition-transform"
              >
                {labels.apply}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
