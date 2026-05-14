// Floating Action Button for the create flow. Sits above the BottomNav
// on mobile and is hidden on desktop (desktop uses the "Criar" entry in
// the sidebar/header instead).
//
// Capacitor-friendly: a sticky full-width wrapper aligns the button to
// the right edge of the scroll column without using position: fixed.
// pointer-events-none on the wrapper keeps it from blocking taps on the
// content rows below; the button itself re-enables pointer events.
//
// Visual cue when the CreateActionSheet is open: the Plus rotates 45° so
// the icon morphs into an X. State of the sheet lives in the parent;
// this component just receives `isOpen` for the rotation hint.

import { Plus } from "lucide-react";
import { useBrand } from "@/hooks/useBrand";

interface CreateFABProps {
  onClick: () => void;
  /** When the linked CreateActionSheet is open, the icon rotates 45°. */
  isOpen?: boolean;
}

export default function CreateFAB({ onClick, isOpen = false }: CreateFABProps) {
  const brand = useBrand();
  const isPT = brand.lang === "pt-BR";
  // TODO Wave C: t.create.fabAriaLabel
  const ariaLabel = isPT ? "Criar" : "Create";

  return (
    <div className="lg:hidden sticky bottom-[88px] z-30 flex justify-end pr-3.5 pointer-events-none">
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className="pointer-events-auto w-14 h-14 rounded-full bg-coral shadow-glow-cta flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus
          className={`w-6 h-6 text-on-coral transition-transform duration-200 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
          strokeWidth={2.4}
        />
      </button>
    </div>
  );
}
