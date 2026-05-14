// Brand routing for Deno edge functions.
// Mirrors the client-side src/lib/brand.ts split between the US legacy
// (CollabShoot) and the BR launch (PermutaModel). Email functions use
// brandFor() to pick sender, copy language, palette accent, and footer
// links based on the user's metadata or profile country.

export type BrandKey = "us" | "br";

export interface Brand {
  key: BrandKey;
  name: string;
  url: string;
  fromEmail: string;
  fromName: string;
  /** Where users mail to opt out of marketing emails. */
  unsubscribeEmail: string;
  /** Used to route into the matching template language. */
  lang: "en" | "pt-BR";
  /** Primary CTA accent color. Templates use this for buttons + accents. */
  primaryColor: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  us: {
    key: "us",
    name: "CollabShoot",
    url: "https://collabshoot.com",
    fromEmail: "noreply@collabshoot.com",
    fromName: "CollabShoot",
    unsubscribeEmail: "unsubscribe@collabshoot.com",
    lang: "en",
    primaryColor: "#a67c3d",
  },
  br: {
    key: "br",
    name: "PermutaModel",
    url: "https://permutamodel.com.br",
    fromEmail: "noreply@permutamodel.com.br",
    fromName: "PermutaModel",
    unsubscribeEmail: "descadastrar@permutamodel.com.br",
    lang: "pt-BR",
    primaryColor: "#FF6B4A",
  },
};

/**
 * Pick the brand. Prefers explicit lang signal ("pt-BR" → BR), falls back
 * to country code ("BR" → BR). Default is BR because the launch target is
 * Brazil; CollabShoot rows only flow through when country/lang explicitly
 * say US/EN.
 *
 * The default flip from US → BR is deliberate. Spec section 5.4:
 * "Default: brand BR (porque alvo principal)."
 */
export function brandFor(country?: string | null, lang?: string | null): Brand {
  if (lang && lang.toLowerCase().startsWith("pt")) return BRANDS.br;
  if (country && country.toUpperCase() === "BR") return BRANDS.br;
  if (lang && lang.toLowerCase().startsWith("en")) return BRANDS.us;
  if (country && country.toUpperCase() === "US") return BRANDS.us;
  return BRANDS.br;
}
