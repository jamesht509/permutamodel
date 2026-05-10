import { useMemo } from "react";
import { getBrand, type BrandConfig } from "@/lib/brand";

export function useBrand(): BrandConfig {
  return useMemo(() => getBrand(), []);
}
