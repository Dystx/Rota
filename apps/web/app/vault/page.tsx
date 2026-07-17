import * as React from "react";
import { PublicRouteLayout } from "../_components/public-route-layout";
import { RouteRecovery } from "../_components/route-recovery";
import { VaultGallery } from "./_components/vault-gallery";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
import { getTripsForUser } from "@repo/db";

/**
 * Vault page — Saved Vault & Export (1.7 reference parity).
 *
 * Source: docs/reference/rumia-console/1.7-saved-vault-export.html
 *
 * The gallery lives in a client component so the sliding export drawer
 * can be opened by clicking a card. The drawer slides in from the right
 * and echoes the selected trip's title.
 */
export default async function VaultPage() {
  const currentUser = await getCurrentUser();
  if (currentUser.outcome === "unavailable") {
    return (
      <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
        <RouteRecovery kind="unavailable" />
      </PublicRouteLayout>
    );
  }

  const { user } = currentUser;
  const actorOutcome = user
    ? await loadCurrentAuthorizedActorOutcome(currentUser.sessionOutcome)
    : { kind: "anonymous" as const };
  if (actorOutcome.kind === "unavailable") {
    return (
      <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
        <RouteRecovery kind="unavailable" />
      </PublicRouteLayout>
    );
  }

  const actor = actorOutcome.kind === "ready" ? actorOutcome.actor : null;
  const trips = user && actor ? await getTripsForUser(user.id, 24, { actor }) : [];
  return (
    <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
      <div className="rumia-vault-page flex flex-col font-body-md text-body-md" data-testid="vault-assets">
        <div className="flex-grow pt-[88px] pb-section-gap px-container-padding-sm md:px-container-padding-lg max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-section-gap relative">
          <VaultGallery trips={trips} />
        </div>
      </div>
    </PublicRouteLayout>
  );
}
