import type { ReactNode } from "react";
import { AppLayout } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

/** Shared traveler chrome for the account utility surface. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout variant="app" topNav={<TopNav />} surface="linen" surfaceTexture="none" siteFooter={<SiteFooter mode="utility" />}>
      {children}
    </AppLayout>
  );
}
