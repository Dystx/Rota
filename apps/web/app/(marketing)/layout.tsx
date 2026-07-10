import type { ReactNode } from "react";
import { AppLayout } from "@repo/ui";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/** Shared public/traveler chrome for the marketing discovery routes. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout
      variant="marketing"
      topNav={<TopNav />}
      siteFooter={<SiteFooter />}
    >
      {children}
    </AppLayout>
  );
}
