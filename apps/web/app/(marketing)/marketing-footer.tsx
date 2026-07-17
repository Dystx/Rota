"use client";

import { usePathname } from "next/navigation";

import { SiteFooter, type SiteFooterMode } from "../_components/site-footer";

/** Route task determines footer weight; the route content does not inherit a
 * marketing footer accidentally. Keep this mapping pure so it can be tested
 * without a browser. */
export function resolveMarketingFooterMode(pathname: string | null): SiteFooterMode {
  if (pathname === "/" || pathname === "/portugal" || pathname === "/local-expertise") return "full";
  if (pathname === "/explore" || pathname?.startsWith("/explore/") || pathname?.startsWith("/activities/")) return "none";
  return "compact";
}

export function MarketingFooter() {
  const pathname = usePathname();
  return <SiteFooter mode={resolveMarketingFooterMode(pathname)} />;
}
