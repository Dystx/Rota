import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@repo/config";
import { BetaUnavailable } from "../_components/beta-unavailable";

/**
 * /b2b — the B2B partner gateway index.
 *
 * The B2B surface is a white-label landing per partner org:
 * `/b2b/<orgSlug>`. The index exists so the `/b2b` URL resolves;
 * visitors land on the rumia demo org (`rumia`) which is the
 * default partner for unauthenticated visitors.
 */
export default function B2bIndex() {
  if (!isFeatureEnabled("b2bBeta")) {
    return (
      <BetaUnavailable
        title="Partner workspaces are in private beta"
        description="Rumia is preparing organization-specific travel workspaces. This surface is available only to approved partners during the beta."
      />
    );
  }

  redirect("/b2b/rumia");
}
