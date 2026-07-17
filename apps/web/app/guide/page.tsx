import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@repo/config";
import { getCurrentUser } from "@/lib/auth/current-user";
import { BetaUnavailablePanel } from "../_components/beta-unavailable";
import { RouteRecovery } from "../_components/route-recovery";

/**
 * /guide — the operator onboarding index.
 *
 * The only public guide surface today is the specialist
 * onboarding flow at `/guide/onboarding`. Future guides
 * (e.g. `/guide/admin`, `/guide/concierge`) will land here.
 */
export default async function GuideIndex() {
  const currentUser = await getCurrentUser();
  if (currentUser.outcome === "unavailable") {
    return <RouteRecovery kind="unavailable" />;
  }
  if (!currentUser.user) {
    redirect("/sign-in?next=%2Fguide");
  }

  if (!isFeatureEnabled("guideBeta")) {
    return (
      <BetaUnavailablePanel
        title="Specialist onboarding is in private beta"
        description="Rumia is onboarding a limited group of Portugal specialists while verification and operations are finalized."
      />
    );
  }

  redirect("/guide/onboarding");
}
