import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface FavProfile {
  id: string;
  favoriteId: string;
  name: string;
  role: string;
  city: string | null;
  state: string | null;
  rating_avg: number | null;
  total_reviews: number | null;
  verified_level: string;
  plan: string;
  styles: string[] | null;
  avatar_url: string | null;
  cover_url: string | null;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [profiles, setProfiles] = useState<FavProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: favs } = await supabase
        .from("favorites")
        .select("id, favorited_user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!favs || favs.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const ids = favs.map((f) => f.favorited_user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, role, city, state, rating_avg, total_reviews, verified_level, plan, styles, avatar_url")
        .in("id", ids);

      const { data: photos } = await supabase
        .from("photos")
        .select("user_id, url")
        .in("user_id", ids)
        .eq("is_cover", true);
      const coverMap = new Map(photos?.map((p) => [p.user_id, p.url]) || []);

      const favMap = new Map(favs.map((f) => [f.favorited_user_id, f.id]));

      setProfiles(
        (profs || []).map((p) => ({
          ...p,
          favoriteId: favMap.get(p.id) || "",
          cover_url: coverMap.get(p.id) || p.avatar_url,
        }))
      );
      setLoading(false);
    };
    load();
  }, [user]);

  const removeFavorite = async (favId: string, profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    await supabase.from("favorites").delete().eq("id", favId);
  };

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">{t.favorites.title}</h1>
      </div>

      <div className="px-3 py-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card/40 border border-border">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="p-3 space-y-2"><div className="h-3 w-16 bg-muted animate-pulse rounded" /></div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-heading text-lg text-foreground mb-1">{t.favorites.noFavorites}</p>
            <p className="font-body text-sm text-muted-foreground mb-4">{t.favorites.noFavoritesSub}</p>
            <button
              onClick={() => navigate("/discover")}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-body font-medium"
            >
              {t.nav.discover}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {profiles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-2xl overflow-hidden bg-card/40 border border-border cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_40px_hsl(37_42%_60%/0.08)] transition-all duration-300"
                onClick={() => navigate(`/profile/${p.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={p.cover_url || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-background via-background/40 to-transparent" />

                  {p.verified_level !== "none" && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-secondary px-2.5 py-1 rounded-full text-[10px] font-bold text-primary-foreground">✓ {t.discover.verified.toUpperCase()}</div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); removeFavorite(p.favoriteId, p.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-foreground font-bold text-sm font-heading">{p.name}</p>
                      <span className="text-[9px] px-1.5 py-px rounded-md bg-foreground/10 backdrop-blur-sm text-foreground/70 font-body font-medium uppercase tracking-wide">
                        {p.role === "dual" ? "Both" : p.role}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.city || "Unknown"}{p.state ? `, ${p.state}` : ""}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-primary text-xs font-semibold">{Number(p.rating_avg || 0).toFixed(1)}</span>
                      <span className="text-muted-foreground text-[10px]">({p.total_reviews || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 flex flex-wrap gap-1">
                  {(p.styles || []).slice(0, 2).map((style) => (
                    <span key={style} className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">{style}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
