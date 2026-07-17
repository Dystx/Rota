import * as React from "react";
import { isFeatureEnabled } from "@repo/config";
import { BetaUnavailablePanel } from "@/app/_components/beta-unavailable";
import { PublicRouteLayout } from "@/app/_components/public-route-layout";

/**
 * Organization workspaces stay generic until membership authorization exists.
 * In particular, this boundary must not resolve a slug or reveal branding to
 * an unauthenticated or otherwise unverified request.
 */
export default async function B2BLandingPage({
  params: _params
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  void _params;
  const enabled = isFeatureEnabled("b2bBeta");

  return (
    <PublicRouteLayout
      scene="utility"
      footerMode="none"
      surfaceTone="linen"
      surfaceTexture="none"
      navigation="none"
    >
      <BetaUnavailablePanel
        title={enabled ? "Workspace is not available" : "Partner workspaces are in private beta"}
        description={enabled
          ? "This partner workspace requires an approved invitation. We do not disclose organization details before membership is verified."
          : "This partner workspace is not publicly available yet."}
        returnHref="/"
      />
    </PublicRouteLayout>
  );
}
