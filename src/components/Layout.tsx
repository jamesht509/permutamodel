import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, Megaphone, PlusCircle, MessageCircle, UserIcon, X, Camera, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CreateCastingModal from "@/components/castings/CreateCastingModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useBrand } from "@/hooks/useBrand";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const brand = useBrand();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showCastingModal, setShowCastingModal] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScroll = useRef(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnreadMessages(count || 0);
    };
    fetchUnread();
    const channel = supabase
      .channel("layout-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const navItems = [
    { icon: Search, label: t.nav.discover, path: "/discover" },
    { icon: ClipboardList, label: t.nav.dashboard, path: "/dashboard" },
    { icon: PlusCircle, label: t.common.done === "Pronto" ? "Criar" : "Create", path: "#create" },
    { icon: MessageCircle, label: t.nav.messages, path: "/messages" },
    { icon: UserIcon, label: t.nav.profile, path: "/profile" },
  ];

  // Hide nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setNavVisible(current < lastScroll.current || current < 60);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (path: string) => {
    if (path === "#create") {
      setShowCreate(true);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 fixed left-0 top-0 h-full bg-background/95 backdrop-blur-xl border-r border-border z-40" role="navigation" aria-label="Sidebar navigation">
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
                  onClick={() => setShowCreate(true)}
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

      {/* Main Content — opacity-only transition (no transform — Safari iOS breaks fixed children with transform parent) */}
      <main className="flex-1 md:ml-20 lg:ml-64 pb-24 md:pb-0 md:flex md:justify-center" role="main">
        <div className="w-full md:max-w-7xl md:px-6 lg:px-8">
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

      {/* Mobile Bottom Nav — hides on scroll */}
      <nav
        aria-label="Main navigation"
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-background backdrop-blur-xl border-t border-border z-40 safe-area-pb transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-around px-2 py-1.5 pb-1" role="tablist">
          {navItems.map((item) => {
            const active = item.path !== "#create" && isActive(item.path);
            const Icon = item.icon;

            if (item.path === "#create") {
              return (
                <button
                  key={item.label}
                  onClick={() => setShowCreate(true)}
                  aria-label="Create new content"
                  className="-mt-5 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                >
                  <PlusCircle className="w-6 h-6 text-primary-foreground" />
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                role="tab"
                aria-selected={active}
                aria-label={item.label}
                className="flex flex-col items-center gap-0.5 py-1.5 px-4 min-w-[3rem] relative"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                  {item.path === "/messages" && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-body transition-colors ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-bold text-foreground">{t.common.done === "Pronto" ? "Criar" : "Create"}</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setShowCreate(false); setShowCastingModal(true); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-foreground/[0.04] border border-border hover:bg-foreground/[0.08] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-body font-semibold text-foreground">{t.common.done === "Pronto" ? "Novo Casting" : "New Casting Call"}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.common.done === "Pronto" ? "Encontre talentos pro seu próximo ensaio" : "Find talent for your next shoot"}</p>
                  </div>
                </button>

                <button
                  onClick={() => { setShowCreate(false); navigate("/profile/edit"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-foreground/[0.04] border border-border hover:bg-foreground/[0.08] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/40 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-body font-semibold text-foreground">{t.common.done === "Pronto" ? "Adicionar Foto" : "Add Portfolio Photo"}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.common.done === "Pronto" ? "Mostre seu melhor trabalho" : "Showcase your best work"}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateCastingModal open={showCastingModal} onClose={() => setShowCastingModal(false)} />
    </div>
  );
}
