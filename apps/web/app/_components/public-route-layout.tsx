import * as React from "react";
import type { ReactNode } from "react";
import { AppLayout, type AppSurface, type AppSurfaceTexture } from "@repo/ui";
import type { RouteSceneTone } from "./route-scene";
import { TopNav } from "./top-nav";
import { SiteFooter, type SiteFooterMode } from "./site-footer";

/** Shared public chrome for utility, legal, and offline routes. */
export type PublicRouteFooterMode = SiteFooterMode;

export interface PublicRouteLayoutProps {
  children: ReactNode;
  /** The route's authored visual grammar. */
  scene: RouteSceneTone;
  /** Full, compact, utility, or no footer depending on route task. */
  footerMode: PublicRouteFooterMode;
  /** Explicit page surface and texture; no route falls through to defaults. */
  surfaceTone: AppSurface;
  surfaceTexture: AppSurfaceTexture;
  /** Immersive product routes retain the frame marker without marketing nav. */
  navigation?: "public" | "none";
}

export function PublicRouteLayout({
  children,
  scene,
  footerMode,
  surfaceTone,
  surfaceTexture,
  navigation = "public"
}: PublicRouteLayoutProps) {
  return (
    <AppLayout
      data-testid="public-route-layout"
      data-scene={scene}
      data-shell="public"
      data-footer-mode={footerMode}
      variant="marketing"
      topNav={navigation === "public" ? <TopNav /> : undefined}
      surface={surfaceTone}
      surfaceTexture={surfaceTexture}
      siteFooter={footerMode === "none" ? null : <SiteFooter mode={footerMode} />}
    >
      {children}
    </AppLayout>
  );
}
