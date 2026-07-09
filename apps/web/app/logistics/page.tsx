import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { MobilityTiles } from "../_components/logistics/mobility-tiles";
import { redirect } from "next/navigation";
import { getOwnedTrip } from "@/app/lib/trip-access";

/**
 * Logistics page — Mock 1.3 (Smart Logistical Cards).
 *
 * Source: docs/prototype.html (LogisticsPage component).
 * Single centered glass card on a blurred transit-network background with
 * two large selectable mobility tiles and a back/continue footer.
 * State (selected tile) is owned by the client-only `MobilityTiles` component.
 */
export default async function LogisticsPage({
  searchParams
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const tripId = (await searchParams).trip?.trim();
  if (!tripId) redirect("/planner");

  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind === "anonymous") {
    redirect(`/sign-in?next=${encodeURIComponent(`/logistics?trip=${tripId}`)}`);
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const trip = tripAccess.trip;

  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-container-padding-sm md:p-container-padding-lg">
        {/* Deep Map Blur Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage:
                "url('https://picsum.photos/seed/transit-network-blur/1920/1080')",
              filter: "blur(12px) brightness(1.05)",
            }}
          />
          <div className="absolute inset-0 bg-glass-light/30" />
        </div>

        {/* Main Card Container */}
        <main id="main-content" className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="glass-panel-light rounded-xl p-8 md:p-12 deep-shadow flex flex-col gap-8">
            <MobilityTiles />
          </div>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
