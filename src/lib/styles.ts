// Style taxonomy.
// DB persistence uses the EN keys (profiles.styles[], casting_calls.styles[]),
// display uses brand-aware lookup via t.styles[key]. The list itself was
// decided in Fase 6 for the BR launch (passarela / comercial / etc., see
// PROMPT_SESSAO_2 Seção 5); the keys are EN slugs so the schema stays
// language-neutral.

import type { Strings } from "@/lib/strings";

export const STYLE_KEYS = [
  "runway",
  "commercial",
  "fitness",
  "maternity",
  "kids",
  "sensual",
  "fashion",
  "lifestyle",
  "editorial",
  "beauty",
  "wedding",
  "food",
  "product",
  "event",
  "sports",
  "newborn",
  "graduation",
] as const;

export type StyleKey = (typeof STYLE_KEYS)[number];

/** Brand-aware display label for a style key. Falls back to the key itself
 *  if the row in DB doesn't match a known style (forward-compat). */
export function labelForStyle(key: string, styles: Strings["styles"]): string {
  return (styles as Record<string, string>)[key] ?? key;
}
