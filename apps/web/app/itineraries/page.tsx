import Link from "next/link";
import { redirect } from "next/navigation";
import { DecisionStatePanel, Icon } from "@repo/ui";
import { PublicRouteLayout } from "../_components/public-route-layout";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTripsForUser, loadPostgresAuthorizationContext } from "@repo/db";
import { ItinerarySearch } from "./_components/itinerary-search";

/**
 * Itineraries — saved-trips archive for the signed-in traveler.
 *
 * Reads the user's trips from PostgreSQL (filtered by
 * `owner_user_id`), passes them to a small client island for
 * search + status filter, and renders the rest as static cards.
 *
 * Auth: the page is server-rendered. Anonymous visitors are sent to sign-in
 * before the privileged list query runs.
 */
export default async function ItinerariesPage({
  searchParams
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?next=%2Fitineraries");
  }

  const { notice } = await searchParams;
  const actor = await loadPostgresAuthorizationContext(user.id);
  const trips = actor ? await getTripsForUser(user.id, 24, { actor }) : [];

  return (
    <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
      <div className="flex flex-col font-body-md">
        <div className="flex-1 px-container-padding-sm md:px-container-padding-lg max-w-7xl mx-auto w-full pt-8 pb-24">
          <header className="mb-8">
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary mb-2">
              Itineraries
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Your personalized archive of curated itineraries and inspirations.
            </p>
            {notice === "unavailable" ? (
              <p role="status" className="mt-4 font-body-md text-body-md text-on-surface-variant">
                That itinerary is unavailable. Choose one from your archive.
              </p>
            ) : null}
          </header>

          {trips.length === 0 ? (
            <EmptyState signedIn />
          ) : (
            <ItinerarySearch trips={trips} />
          )}
        </div>
      </div>
    </PublicRouteLayout>
  );
}

function EmptyState({ signedIn }: { signedIn: boolean }) {
  return (
    <DecisionStatePanel
      data-testid="itineraries-empty"
      kind="empty"
      tone="inverse"
      className="mx-auto max-w-2xl rounded-xl border-olive-light/20 px-6 py-12"
      title={signedIn ? "Nothing on the map yet." : "Sign in to see your trips."}
      description={signedIn
        ? "Let’s plot your first route. Tell us where you want to go — once you confirm the brief, your itinerary lands here."
        : "Your saved trips, vault exports, and human-review requests show up here. Anonymous browsing doesn’t store anything yet."}
      illustration={<Icon name="map" aria-hidden />}
      primaryAction={(
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 rounded-full bg-ochre-light px-6 py-3 font-label-ui text-label-ui text-primary transition-colors hover:bg-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Plan a trip
        </Link>
      )}
      secondaryAction={(
        <Link
          href={signedIn ? "/vault" : "/account"}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-label-ui text-label-ui text-linen-dark transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          {signedIn ? "Browse the vault" : "Sign in"}
        </Link>
      )}
    />
  );
}
