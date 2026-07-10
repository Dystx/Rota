import * as React from "react";
import type { ReactNode } from "react";
import { AppLayout } from "@repo/ui";
import { TopNav } from "./top-nav";
import { SiteFooter } from "./site-footer";

/** Shared public chrome for utility, legal, and offline routes. */
export function PublicRouteLayout({ children }: { children: ReactNode }) {
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
