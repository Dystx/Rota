import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicRouteLayout } from "../_components/public-route-layout";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTripsForUser } from "@repo/db";
import { ItinerarySearch } from "./_components/itinerary-search";

/**
 * Itineraries — saved-trips archive for the signed-in traveler.
 *
 * Reads the user's trips from Supabase (filtered by
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
  const trips = await getTripsForUser(user.id);

  return (
    <PublicRouteLayout>
      <div className="min-h-screen flex flex-col font-body-md">
        <div className="flex-1 px-container-padding-sm md:px-container-padding-lg max-w-7xl mx-auto w-full pt-8 pb-24">
          <header className="mb-8">
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary mb-2">
              Itineraries
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Your personalized archive of curated itineraries and inspirations.
            </p>
            {notice === "unavailable" ? (
              <p role="status" className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
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
    <div
      data-testid="itineraries-empty"
      className="bg-glass-light/60 backdrop-blur-md rounded-xl border border-olive-light/20 p-card-padding text-center max-w-2xl mx-auto"
    >
      <span className="ph text-[48px] text-olive-light mb-3 block">
        map
      </span>
        <h2 className="font-display-mobile text-headline-sm md:font-display md:text-headline text-primary mb-2 italic">
          {signedIn ? "Nothing on the map yet." : "Sign in to see your trips."}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-prose mx-auto">
          {signedIn
            ? "Let’s plot your first route. Tell us where you want to go — once you confirm the brief, your itinerary lands here."
            : "Your saved trips, vault exports, and human-review requests show up here. Anonymous browsing doesn’t store anything yet."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 bg-olive-light text-on-primary font-label-ui text-label-ui px-6 py-2.5 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Plan a trip
        </Link>
        {signedIn ? (
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 font-label-ui text-label-ui text-olive-dark border border-olive-light/40 px-6 py-2.5 rounded-full hover:bg-olive-light/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Browse the vault
          </Link>
        ) : (
          <Link
            href="/account"
            className="inline-flex items-center gap-2 font-label-ui text-label-ui text-olive-dark border border-olive-light/40 px-6 py-2.5 rounded-full hover:bg-olive-light/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
