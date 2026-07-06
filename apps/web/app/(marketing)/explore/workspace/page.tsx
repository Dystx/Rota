import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "../../../_components/top-nav";
import { SiteFooter } from "../../../_components/site-footer";
import { WorkspaceCanvasClient } from "./workspace-canvas-client";
import { WorkspaceShell } from "./workspace-shell";
import { fixtureRouteCollection, fixtureRouteSummary } from "@repo/spatial-engine";

export const metadata: Metadata = {
  title: "Trip Workspace | Rumia Spatial Engine",
  description:
    "The 2D counterpart to the Spatial Engine globe — flat mercator projection, itinerary overlay, stop markers, and ambient presence rendered through the provider-agnostic layer registry.",
  alternates: {
    canonical: "/explore/workspace"
  }
};

export default function WorkspaceDemoPage() {
  const stops = fixtureRouteSummary();
  // Phase 4.1: build the workspace-shell's stop list from the
  // same route fixture the engine renders. This keeps the
  // filmstrip and the on-map markers in sync without a remote
  // trip query — the page is still a demo of the spatial engine
  // surface, not a real trip.
  const shellStops = React.useMemo(() => {
    const collection = fixtureRouteCollection();
    return collection.features
      .filter((feature) => feature.geometry.type === "Point")
      .map((feature, index) => {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const [lng, lat] = feature.geometry.coordinates as [number, number];
        const label = typeof props.label === "string" ? props.label : `Stop ${index + 1}`;
        const note = typeof props.note === "string" ? props.note : "";
        const hours = [9, 12, 15];
        const minutes = [0, 30, 0];
        const timeIndex = index % 3;
        const time = `${String(hours[timeIndex]).padStart(2, "0")}:${String(minutes[timeIndex]).padStart(2, "0")}`;
        return {
          order: index + 1,
          label,
          note,
          scheduledTime: time,
          coordinates: [lng, lat] as const
        };
      });
  }, []);

  return (
    <>
      <TopNav />
      <main id="main-content" className="pt-header-height min-h-screen bg-background text-on-background antialiased">
        <section className="mx-auto grid max-w-7xl gap-12 px-container-padding-sm md:px-[48px] py-section-gap">
          <header className="grid gap-4 text-center md:text-left">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
              Spatial Engine · Trip Workspace
            </p>
            <h1 className="font-display text-display-mobile md:text-display text-primary leading-tight">
              Edit the route on a <span className="italic text-ochre-dark">flat</span> canvas.
            </h1>
            <p className="text-on-surface-variant leading-loose text-lg max-w-2xl">
              Same Spatial Engine, mercator projection, three reference layers (ambient pulse,
              specialist badges, itinerary route) — all driven by the layer registry and the
              provider-agnostic TelemetryService.
            </p>
          </header>

          <div className="relative">
            <WorkspaceCanvasClient />
            <WorkspaceShell stops={shellStops} />
          </div>

          <section className="grid gap-8 md:grid-cols-[1.5fr_1fr] items-start">
            <article className="rounded-2xl border border-olive-dark/10 bg-linen-dark/70 p-card-padding">
              <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-primary leading-tight">
                Five-day itinerary · Porto → Lisbon
              </h2>
              <ol className="mt-4 grid gap-3">
                {stops.map((stop, index) => (
                  <li key={stop.name} className="grid grid-cols-[auto_1fr] items-start gap-4 border-b border-olive-dark/5 pb-3 last:border-0">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mt-1">
                      Day {index + 1}
                    </span>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-primary">{stop.name}</p>
                      <p className="text-on-surface-variant leading-loose text-sm">{stop.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="grid gap-4 rounded-2xl border border-olive-dark/10 bg-linen-dark/70 p-card-padding">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
                Layer Registry
              </p>
              <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-primary leading-tight">
                Three layers, one engine
              </h2>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>AmbientPulseLayer</span>
                  <code className="font-mono-micro text-mono-micro uppercase tracking-[0.1em] text-olive-light">travelers</code>
                </li>
                <li className="flex items-center justify-between">
                  <span>SymbolBadgesLayer</span>
                  <code className="font-mono-micro text-mono-micro uppercase tracking-[0.1em] text-olive-light">specialists</code>
                </li>
                <li className="flex items-center justify-between">
                  <span>RouteLayer</span>
                  <code className="font-mono-micro text-mono-micro uppercase tracking-[0.1em] text-olive-light">trips</code>
                </li>
              </ul>
              <p className="text-on-surface-variant leading-loose text-sm">
                Each layer self-binds to its channel via <code className="font-mono-micro">bindLayerToChannel()</code>.
                Disable, reorder, or swap the underlying renderer without touching layer code.
              </p>
              <Link
                href="/explore"
                className="mt-2 inline-flex w-fit items-center gap-2 font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-olive-light hover:text-ochre-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">public</span>
                See the 3D globe →
              </Link>
            </article>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}