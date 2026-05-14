// Create action sheet — bottom sheet triggered by the CreateFAB. Lists
// quick-create entry points: new casting, upload photo. Wave 2 adds a
// 3rd entry for "Modo Bora" (swipe discovery).
//
// Replaces the legacy in-Layout modal that used a center-screen card
// pattern; the new sheet style aligns with FiltersSheet and the rest of
// the mobile-first redesign.
//
// Actions are passed as callbacks because the targets are stateful flows,
// not routes: "Novo trampo" opens the existing CreateCastingModal in
// Layout.tsx, "Adicionar foto" navigates to the profile editor where the
// uploader lives embedded.

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, Camera, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface CreateActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCasting: () => void;
  onUploadPhoto: () => void;
}

export default function CreateActionSheet({
  isOpen,
  onClose,
  onCreateCasting,
  onUploadPhoto,
}: CreateActionSheetProps) {
  const t = useTranslation();
  const labels = t.create;

  // ESC closes.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handle = (fn: () => void) => {
    onClose();
    fn();
  };

  const actions = [
    {
      icon: ClipboardList,
      label: labels.novoTrampo,
      sub: labels.novoTrampoSub,
      onClick: () => handle(onCreateCasting),
    },
    {
      icon: Camera,
      label: labels.addFoto,
      sub: labels.addFotoSub,
      onClick: () => handle(onUploadPhoto),
    },
    // Wave 2: insert "Modo Bora" entry here.
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
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
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl safe-area-pb"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-ink-tertiary/50" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="font-display text-base font-medium text-ink">{labels.title}</h2>
              <button
                onClick={onClose}
                aria-label={labels.close}
                className="w-10 h-10 flex items-center justify-center text-ink-secondary active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-5 pb-6 space-y-2">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-elevated active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="w-11 h-11 rounded-full bg-coral/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-coral" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-sm">{a.label}</p>
                      <p className="text-xs text-ink-tertiary truncate">{a.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
