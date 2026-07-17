import type { ReactNode } from "react";
import { PublicRouteLayout } from "../_components/public-route-layout";

export default function ExpertChatLayout({ children }: { children: ReactNode }) {
  return (
    <PublicRouteLayout
      scene="utility"
      footerMode="none"
      surfaceTone="linen"
      surfaceTexture="none"
      navigation="none"
    >
      {children}
    </PublicRouteLayout>
  );
}
