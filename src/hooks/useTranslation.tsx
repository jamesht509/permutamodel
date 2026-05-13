import { useMemo } from "react";
import { useBrand } from "@/hooks/useBrand";
import { getStrings, type Strings, type AppTranslations } from "@/lib/strings";

export function useTranslation(): Strings {
  const brand = useBrand();
  return useMemo(() => getStrings(brand.lang), [brand.lang]);
}

// Re-export for legacy import paths that referenced the type via this module.
export type { Strings, AppTranslations };
