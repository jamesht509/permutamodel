// Mobile bottom navigation — 4 tabs sticky at the bottom of the
// viewport. Hidden on lg+ (desktop uses Layout.tsx sidebar).
//
// Capacitor-friendly: position: sticky (not fixed), safe-area-pb,
// touch targets ≥44px, active:scale-95 for tactile feedback.
//
// Unread badge surfaces on Recadinhos (messages). The badge query lives
// in Layout.tsx; this component receives the count via prop so the
// network call stays in one place.

import { useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, MessageCircle, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface BottomNavProps {
  /** Unread message count for the badge on Recadinhos. */
  unreadMessages: number;
}

export default function BottomNav({ unreadMessages }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();

  const pathname = location.pathname;
  const isHomeActive = pathname === "/discover" || pathname.startsWith("/discover/");
  const isJobsActive = pathname.startsWith("/castings");
  const isChatActive = pathname.startsWith("/messages");
  const isMeActive = pathname.startsWith("/profile");

  const items = [
    { icon: Home, label: t.bottomNav.home, path: "/discover", active: isHomeActive, showBadge: false },
    { icon: Briefcase, label: t.bottomNav.jobs, path: "/castings", active: isJobsActive, showBadge: false },
    { icon: MessageCircle, label: t.bottomNav.chat, path: "/messages", active: isChatActive, showBadge: true },
    { icon: User, label: t.bottomNav.me, path: "/profile", active: isMeActive, showBadge: false },
  ];

  return (
    <nav
      aria-label={t.bottomNav.mainNavAria}
      className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-surface border-t border-strong safe-area-pb"
    >
      <ul className="flex items-stretch justify-around px-2 pt-2.5 pb-2.5" role="tablist">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <button
                onClick={() => navigate(item.path)}
                role="tab"
                aria-selected={item.active}
                aria-label={item.label}
                className="w-full flex flex-col items-center gap-1 py-1 min-h-[44px] active:scale-95 transition-transform"
              >
                <div className="relative">
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors ${
                      item.active ? "text-coral" : "text-ink-tertiary"
                    }`}
                    strokeWidth={item.active ? 2.4 : 2}
                  />
                  {item.showBadge && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-coral text-on-coral text-[9px] font-semibold flex items-center justify-center px-1">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] leading-none transition-colors ${
                    item.active ? "text-coral font-medium" : "text-ink-tertiary font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
