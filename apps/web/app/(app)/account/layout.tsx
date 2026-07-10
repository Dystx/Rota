import type { ReactNode } from "react";
import { AppLayout } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

/** Shared traveler chrome for account and saved-trip surfaces. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout variant="app" topNav={<TopNav />} siteFooter={<SiteFooter />}>
      {children}
    </AppLayout>
  );
}
