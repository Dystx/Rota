import { PublicRouteLayout } from "../_components/public-route-layout";
import { MobilityTiles } from "../_components/logistics/mobility-tiles";
import { redirect } from "next/navigation";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { persistLogisticsTransport } from "./actions";

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
    // Do not reflect an arbitrary trip id in an unauthenticated redirect.
    redirect("/sign-in");
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const trip = tripAccess.trip;

  return (
    <PublicRouteLayout scene="decision" footerMode="none" surfaceTone="linen" surfaceTexture="none" navigation="none">
      <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-container-padding-sm md:p-container-padding-lg">
        {/* Deep Map Blur Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage:
                "url('/hero/portugal-coast-golden-hour.svg')",
              filter: "blur(12px) brightness(1.05)",
            }}
          />
          <div className="absolute inset-0 bg-glass-light/30" />
        </div>

        {/* Main Card Container */}
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="glass-panel-light rounded-xl p-8 md:p-12 deep-shadow flex flex-col gap-8">
            <header className="text-center">
              <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-2">Route logistics</p>
              <h1 className="font-headline-lg text-headline-lg text-primary">{trip.title}</h1>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Choose how you want to move through {trip.brief.regions.map((region) => region.replace(/-/g, " ")).join(", ")}.
              </p>
            </header>
            <MobilityTiles
              tripId={trip.id}
              initialChoice={trip.brief.transportMode === "rental-car" ? "car" : "transit"}
              onChoiceChange={persistLogisticsTransport.bind(null, trip.id)}
            />
          </div>
        </div>
      </div>
    </PublicRouteLayout>
  );
}
