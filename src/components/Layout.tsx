import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, PlusCircle, MessageCircle, UserIcon, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import CreateCastingModal from "@/components/castings/CreateCastingModal";
import BottomNav from "@/components/layout/BottomNav";
import CreateFAB from "@/components/discover/CreateFAB";
import CreateActionSheet from "@/components/layout/CreateActionSheet";
import { useTranslation } from "@/hooks/useTranslation";
import { useBrand } from "@/hooks/useBrand";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const brand = useBrand();
  const { user } = useAuth();
  const [showCastingModal, setShowCastingModal] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const unreadMessages = useUnreadMessages();

  const navItems = [
    { icon: Search, label: t.nav.discover, path: "/discover" },
    { icon: ClipboardList, label: t.nav.dashboard, path: "/dashboard" },
    { icon: PlusCircle, label: t.create.fabAria, path: "#create" },
    { icon: MessageCircle, label: t.nav.messages, path: "/messages" },
    { icon: UserIcon, label: t.nav.profile, path: "/profile" },
  ];

  const handleNav = (path: string) => {
    if (path === "#create") {
      setIsCreateSheetOpen(true);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row">
      {/* Desktop sidebar — lg+ only. Below lg the app is the mobile
          experience (BottomNav + FAB); the old md breakpoint let the
          sidebar and BottomNav both show on tablets. */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full bg-background/95 backdrop-blur-xl border-r border-border z-40" role="navigation" aria-label="Sidebar navigation">
        <div className="p-4 lg:p-6">
          <h1 className="font-heading text-xl font-bold text-foreground hidden lg:block">{brand.name}</h1>
          <span className="font-heading text-xl font-bold text-primary block lg:hidden text-center">{brand.name.replace(/[a-z]/g, "").slice(0, 2)}</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-2 lg:px-4 mt-4">
          {navItems.map((item) => {
            const active = item.path !== "#create" && isActive(item.path);
            const Icon = item.icon;

            if (item.path === "#create") {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsCreateSheetOpen(true)}
                  className="my-4 flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  <PlusCircle className="w-6 h-6" />
                  <span className="hidden lg:inline">Create</span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all hover:scale-[1.02] ${
                  active
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.path === "/messages" && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline font-body text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content — opacity-only transition (no transform — Safari iOS
          breaks fixed children with transform parent). */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 lg:flex lg:justify-center" role="main">
        <div className="w-full lg:max-w-7xl lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile-only widgets — components handle lg:hidden internally. */}
      {user && <CreateFAB onClick={() => setIsCreateSheetOpen(true)} isOpen={isCreateSheetOpen} />}
      {user && <BottomNav unreadMessages={unreadMessages} />}

      {/* Sheets + modals */}
      <CreateActionSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onCreateCasting={() => { setIsCreateSheetOpen(false); setShowCastingModal(true); }}
        onUploadPhoto={() => { setIsCreateSheetOpen(false); navigate("/profile/edit"); }}
      />

      <CreateCastingModal open={showCastingModal} onClose={() => setShowCastingModal(false)} />
    </div>
  );
}
