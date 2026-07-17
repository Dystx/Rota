import type { ReactNode } from "react";
import { PublicRouteLayout } from "../_components/public-route-layout";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
      {children}
    </PublicRouteLayout>
  );
}
