import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTripsForUser } from "@repo/db";
import { ItinerarySearch } from "./_components/itinerary-search";

/**
 * Itineraries — saved-trips archive for the signed-in traveler.
 *
 * Reads the user's trips from Supabase (filtered by
 * `owner_user_id`), passes them to a small client island for
 * search + status filter, and renders the rest as static cards.
 *
 * Auth: the page is server-rendered. If there's no session, the
 * page shows an empty state with a sign-in CTA — the previous
 * hardcoded "Kyoto Autumn Retreat" wireframe is gone.
 */
export default async function ItinerariesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const trips = await getTripsForUser(userId);

  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md">
        <main
          id="main-content"
          className="flex-1 px-container-padding-sm md:px-container-padding-lg max-w-7xl mx-auto w-full pt-8 pb-24"
        >
          <header className="mb-8">
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary mb-2">
              Itineraries
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Your personalized archive of curated itineraries and inspirations.
            </p>
          </header>

          {trips.length === 0 ? (
            <EmptyState signedIn={userId !== null} />
          ) : (
            <ItinerarySearch trips={trips} />
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

function EmptyState({ signedIn }: { signedIn: boolean }) {
  return (
    <div
      data-testid="itineraries-empty"
      className="bg-glass-light/60 backdrop-blur-md rounded-xl border border-olive-light/20 p-card-padding text-center max-w-2xl mx-auto"
    >
      <span className="material-symbols-outlined text-[48px] text-olive-light mb-3 block">
        map
      </span>
      <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
        {signedIn ? "No itineraries yet" : "Sign in to see your itineraries"}
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-prose mx-auto">
        {signedIn
          ? "Once you plan a trip and confirm the brief, your itinerary lands here. The hero's \"Begin Journey\" CTA starts a new one."
          : "Your saved trips, vault exports, and human-review requests show up here. Anonymous browsing doesn't store anything yet."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
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
