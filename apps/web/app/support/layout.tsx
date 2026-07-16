import type { ReactNode } from "react";

import { AppLayout } from "@repo/ui";

import { SiteFooter } from "../_components/site-footer";
import { TopNav } from "../_components/top-nav";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout variant="marketing" topNav={<TopNav />} surface="linen" surfaceTexture="none" siteFooter={<SiteFooter variant="compact" />}>
      {children}
    </AppLayout>
  );
}
