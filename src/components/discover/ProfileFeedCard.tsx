// Full-width vertical profile card for the mobile feed. Hero photo on
// top with overlay nameplate; chips + stats + CTA below.
//
// Type kept minimal here — only the fields the card renders. Wave C
// passes the existing Discover ProfileCard which is a superset. Optional
// fields (total_sessions, age) render their row only when present.

import { useMemo } from "react";
import { Star, Camera, Zap, MapPin, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface ProfileFeedCardData {
  id: string;
  name: string;
  /** "photographer" | "model" | "creative" | "dual" — drives the role label. */
  role: string;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  styles: string[] | null;
  rating_avg: number | null;
  total_reviews: number | null;
  /** Optional — added in Wave C select. */
  total_sessions?: number | null;
  /** Optional — when available_until > now, the "tô na ativa" badge renders. */
  available_until?: string | null;
}

interface ProfileFeedCardProps {
  profile: ProfileFeedCardData;
  /** Distance in km, already calculated by the parent (haversine). Null hides it. */
  distance: number | null;
  /** Whether the viewer has favorited this profile. */
  isFavorite: boolean;
  onTap: (id: string) => void;
  onTapPermuta: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const MAX_CHIPS = 3;

function hoursUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 3_600_000));
}

export default function ProfileFeedCard({ profile, distance, isFavorite, onTap, onTapPermuta, onToggleFavorite }: ProfileFeedCardProps) {
  const t = useTranslation();

  const heroImg = profile.cover_url || profile.avatar_url;
  const role = t.roles[profile.role as keyof typeof t.roles] ?? null;

  const activeHoursLeft = useMemo(() => {
    if (!profile.available_until) return null;
    const h = hoursUntil(profile.available_until);
    return h > 0 ? h : null;
  }, [profile.available_until]);

  const chips = (profile.styles ?? []).slice(0, MAX_CHIPS);
  const extraChips = (profile.styles ?? []).length - chips.length;

  const subtitleParts = [
    profile.city,
    role,
    distance !== null ? t.discover.distanceKm(Math.round(distance)) : null,
  ].filter((x): x is string => Boolean(x));

  return (
    <article
      className="relative mx-3.5 mb-3.5 lg:mx-0 bg-surface rounded-2xl overflow-hidden"
      aria-label={profile.name}
    >
      {/* Hero (tap → profile). Favorite button is a sibling below so we
          don't nest interactive elements inside this button. */}
      <button
        onClick={() => onTap(profile.id)}
        className="relative w-full block aspect-[5/4] bg-elevated active:scale-[0.99] transition-transform"
        aria-label={profile.name}
      >
        {heroImg ? (
          <img
            src={heroImg}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-elevated to-lavender/20" />
        )}

        {/* Badge: tô na ativa */}
        {activeHoursLeft !== null && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-coral/95 text-on-coral text-[10px] font-medium">
            <span className="w-1 h-1 rounded-full bg-on-coral" aria-hidden />
            {t.discover.toNaAtivaBadge(activeHoursLeft)}
          </span>
        )}

        {/* Overlay — nameplate (distance folds into the subtitle line) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/[0.92] via-background/40 to-transparent px-3.5 pt-12 pb-3.5 text-left">
          <p className="text-base font-medium text-ink leading-tight">{profile.name}</p>
          {subtitleParts.length > 0 && (
            <p className="flex items-center gap-1 text-xs text-ink/70 mt-0.5 leading-tight">
              {distance !== null && <MapPin className="w-3 h-3 shrink-0" strokeWidth={2.2} />}
              <span className="truncate">{subtitleParts.join(" · ")}</span>
            </p>
          )}
        </div>
      </button>

      {/* Favorite toggle — sibling of the hero button, sits over its top-right
          corner. Separate element so taps here never fall through to the hero. */}
      <button
        onClick={() => onToggleFavorite(profile.id)}
        aria-label={isFavorite ? t.favorites.remove : t.favorites.add}
        aria-pressed={isFavorite}
        className="absolute top-2 right-2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm active:scale-90 transition-transform"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${isFavorite ? "text-coral fill-coral" : "text-ink/70"}`}
          strokeWidth={2}
        />
      </button>

      {/* Body */}
      <div className="px-3.5 pt-2.5 pb-3.5">
        {/* Chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {chips.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-full bg-elevated text-lavender text-[11px]"
              >
                {c}
              </span>
            ))}
            {extraChips > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-elevated text-ink-tertiary text-[11px]">
                +{extraChips}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3 text-xs text-ink-secondary">
          {profile.rating_avg !== null && profile.rating_avg > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" strokeWidth={1.5} />
              <span className="text-ink">{profile.rating_avg.toFixed(1)}</span>
              {profile.total_reviews ? (
                <span className="text-ink-tertiary">· {profile.total_reviews}</span>
              ) : null}
            </span>
          )}
          {profile.total_sessions != null && profile.total_sessions > 0 && (
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" strokeWidth={1.8} />
              {t.discover.tramposCount(profile.total_sessions)}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onTapPermuta(profile.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-coral text-on-coral text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <Zap className="w-4 h-4" fill="currentColor" strokeWidth={0} />
          {t.discover.chamarPermuta}
        </button>
      </div>
    </article>
  );
}
