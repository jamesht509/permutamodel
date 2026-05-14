// "Tô na ativa" horizontal stories — a row of small avatar rings sitting
// above the profile feed on mobile. Shows up to 5 profiles that are
// currently broadcasting availability; a "+N" tile reveals the rest.
//
// Returns null when there are no candidates so the parent doesn't have
// to guard. Hidden on desktop via lg:hidden (desktop surfaces availability
// through the sidebar filter instead).

import { useTranslation } from "@/hooks/useTranslation";

export interface AvailableNowProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  available_until: string | null;
}

interface AvailableNowStoriesProps {
  profiles: AvailableNowProfile[];
  onTapStory: (profileId: string) => void;
  /** Tap on the "+N" overflow tile (opens full list). Optional. */
  onTapMore?: () => void;
}

const MAX_VISIBLE = 5;

// Stable color choice per profile id — used for the initial-letter fallback
// when avatar_url is missing.
const FALLBACK_BG = ["bg-coral/30", "bg-lavender/30", "bg-elevated", "bg-coral/20", "bg-lavender/20"] as const;
function bgFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FALLBACK_BG[Math.abs(h) % FALLBACK_BG.length];
}

function initial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

export default function AvailableNowStories({ profiles, onTapStory, onTapMore }: AvailableNowStoriesProps) {
  const t = useTranslation();

  if (profiles.length === 0) return null;

  const visible = profiles.slice(0, MAX_VISIBLE);
  const overflow = profiles.length - visible.length;

  return (
    <section
      aria-label={t.discover.toNaAtivaAria}
      className="lg:hidden bg-background"
    >
      <header className="flex items-center gap-1.5 px-4 pt-3 pb-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-coral shrink-0" aria-hidden />
        <h2 className="text-[11px] font-medium text-coral tracking-[0.04em] uppercase">
          {t.discover.toNaAtivaSection}
          <span className="text-ink-tertiary font-normal normal-case"> · {t.discover.toNaAtivaCount(profiles.length)}</span>
        </h2>
      </header>

      <div className="overflow-x-auto scrollbar-hide">
        <ul className="flex gap-3 px-4 pb-3" role="list">
          {visible.map((p) => (
            <li key={p.id} className="shrink-0">
              <button
                onClick={() => onTapStory(p.id)}
                aria-label={p.name}
                className="flex flex-col items-center gap-1.5 w-[58px] active:scale-95 transition-transform"
              >
                {/* Gradient ring */}
                <div
                  className="relative w-[54px] h-[54px] rounded-full p-[2.5px]"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent-warm)), hsl(var(--accent-cool)))",
                  }}
                >
                  <div className="w-full h-full rounded-full bg-background p-[2.5px]">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-ink font-medium text-sm ${bgFromId(p.id)}`}
                        aria-hidden
                      >
                        {initial(p.name)}
                      </div>
                    )}
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-background" />
                </div>
                <span className="text-[11px] text-ink-secondary leading-none truncate w-full text-center">
                  {p.name.split(" ")[0]}
                </span>
              </button>
            </li>
          ))}

          {overflow > 0 && (
            <li className="shrink-0">
              <button
                onClick={onTapMore}
                disabled={!onTapMore}
                aria-label={`${t.discover.seeMore} (+${overflow})`}
                className="flex flex-col items-center gap-1.5 w-[58px] active:scale-95 transition-transform disabled:opacity-50"
              >
                <div className="w-[54px] h-[54px] rounded-full bg-elevated/65 flex items-center justify-center">
                  <span className="text-ink-secondary text-base font-medium leading-none">
                    +{overflow}
                  </span>
                </div>
                <span className="text-[11px] text-ink-tertiary leading-none">
                  {t.discover.seeMore}
                </span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
