import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@repo/config";
import { BetaUnavailable } from "../_components/beta-unavailable";

/**
 * /guide — the operator onboarding index.
 *
 * The only public guide surface today is the specialist
 * onboarding flow at `/guide/onboarding`. Future guides
 * (e.g. `/guide/admin`, `/guide/concierge`) will land here.
 */
export default function GuideIndex() {
  if (!isFeatureEnabled("guideBeta")) {
    return (
      <BetaUnavailable
        title="Specialist onboarding is in private beta"
        description="Rumia is onboarding a limited group of Portugal specialists while verification and operations are finalized."
      />
    );
  }

  redirect("/guide/onboarding");
}
