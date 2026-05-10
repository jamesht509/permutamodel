import { useMemo } from "react";
import { useBrand } from "@/hooks/useBrand";
import { getTranslations, type AppTranslations } from "@/lib/translations";

export function useTranslation(): AppTranslations {
  const brand = useBrand();
  return useMemo(() => getTranslations(brand.lang), [brand.lang]);
}
