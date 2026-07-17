import * as React from "react";
import { isFeatureEnabled } from "@repo/config";
import { BetaUnavailablePanel } from "../_components/beta-unavailable";
import { PublicRouteLayout } from "../_components/public-route-layout";

/**
 * /b2b — the B2B partner gateway index.
 *
 * The B2B surface is a white-label landing per partner org:
 * `/b2b/<orgSlug>`. The index exists so the `/b2b` URL resolves;
 * visitors land on the rumia demo org (`rumia`) which is the
 * default partner for unauthenticated visitors.
 */
export default function B2bIndex() {
  const enabled = isFeatureEnabled("b2bBeta");
  return (
    <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
      <BetaUnavailablePanel
        title={enabled ? "Partner workspace access is not available" : "Partner workspaces are in private beta"}
        description={enabled
          ? "Partner workspaces require an approved invitation. Rumia does not disclose organization details before membership is verified."
          : "Rumia is preparing organization-specific travel workspaces. This surface is available only to approved partners during the beta."}
      />
    </PublicRouteLayout>
  );
}
