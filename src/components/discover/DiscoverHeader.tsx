// Discover page header — wordmark + city + search/notifications.
// Mobile-first; on desktop ≥lg the parent layout supplies the sidebar
// and this header sits at the top of the main column.
//
// Safe-area-aware top padding so the wordmark clears the iOS notch
// when bundled via Capacitor.

import { Search, Bell, MapPin } from "lucide-react";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/hooks/useTranslation";

interface DiscoverHeaderProps {
  userCity: string | null;
  userState: string | null;
  notificationCount: number;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onCityClick: () => void;
}

export default function DiscoverHeader({
  userCity,
  userState,
  notificationCount,
  onSearchClick,
  onNotificationsClick,
  onCityClick,
}: DiscoverHeaderProps) {
  const brand = useBrand();
  const t = useTranslation();
  const isPT = brand.lang === "pt-BR";

  const locationLabel =
    userCity && userState ? `${userCity}, ${userState}` : userCity ?? t.discover.setLocation;
  const hasLocation = Boolean(userCity);

  return (
    <header className="safe-area-pt bg-background border-b border-strong">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: wordmark + city */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="font-display text-[17px] font-medium text-ink leading-none tracking-tight">
            {brand.name}
          </h1>
          <button
            onClick={onCityClick}
            className="flex items-center gap-1 text-[11px] text-ink-tertiary hover:text-ink-secondary active:scale-95 transition-all min-h-[20px]"
            aria-label={isPT ? "Trocar cidade" : "Change city"}
          >
            <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span className={`truncate ${hasLocation ? "text-ink-tertiary" : "text-ink-secondary"}`}>
              {locationLabel}
            </span>
          </button>
        </div>

        {/* Right: search + bell */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSearchClick}
            aria-label={isPT ? "Buscar" : "Search"}
            className="w-9 h-9 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform"
          >
            <Search className="w-[18px] h-[18px] text-ink-secondary" strokeWidth={2} />
          </button>
          <button
            onClick={onNotificationsClick}
            aria-label={isPT ? "Notificações" : "Notifications"}
            className="relative w-9 h-9 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform"
          >
            <Bell className="w-[18px] h-[18px] text-ink-secondary" strokeWidth={2} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
