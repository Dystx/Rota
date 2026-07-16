import type { ReactNode } from "react";
import { AppLayout } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

/** Shared traveler chrome for trip creation and trip workspace routes. */
export default function TripLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout variant="app" topNav={<TopNav />} surface="linen" surfaceTexture="none" siteFooter={null}>
      {children}
    </AppLayout>
  );
}
