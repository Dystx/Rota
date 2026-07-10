"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/useMapStore";
import { fixtureRouteCollection } from "@repo/spatial-engine";
import { publicDestination, publicDestinationDraftUrl } from "../../_components/public-trip-choices";

/**
 * A single stop rendered in the workspace filmstrip. Server-safe shape.
 * `scheduledTime` is derived from `order` (Day 1 = 09:00 / 12:30 / 15:00)
 * so the trip's three beats for the day fall on a natural arc.
 */
export interface WorkspaceStop {
  /** Layer-assigned stop id (matches the GeoJSON feature.id in the route layer). */
  id?: string;
  order: number;
  label: string;
  note: string;
  scheduledTime: string;
  /** [longitude, latitude] when known — used to select + fly the camera. */
  coordinates?: readonly [number, number];
}

interface WorkspaceShellProps {
  /** Today's three stops, ordered by trip order. */
  stops: WorkspaceStop[];
}

/**
 * WorkspaceShell — overlays for mock 1.4 (Dynamic Workspace / Itinerary).
 * Floats three surfaces above the full-bleed map:
 *   - top-left: timeline panel (day pills + headline + Pace & Tone)
 *   - top-right: vertical column of share / download icon buttons
 *   - bottom:   horizontal filmstrip of stop cards + add-stop tile
 *
 * The refinement pills read + write the shared Zustand store
 * (Phase 4.1) so the map's active camera reacts to the user's
 * choice: `pace` adjusts zoom, `tone` adjusts pitch.
 */
export function WorkspaceShell({ stops }: WorkspaceShellProps) {
  const destination = publicDestination("porto");
  const router = useRouter();
  const paceTone = useMapStore((state) => state.paceTone);
  const setPaceTone = useMapStore((state) => state.setPaceTone);
  const selectStop = useMapStore((state) => state.selectStop);

  // Build a label → coordinates map from the route fixture so a filmstrip
  // click can mirror bento-card selection semantics (Zustand + flyTo).
  const labelCoords = React.useMemo(() => {
    const collection = fixtureRouteCollection();
    const map = new Map<string, readonly [number, number]>();
    for (const feature of collection.features) {
      if (feature.geometry.type !== "Point") continue;
      const label = (feature.properties as Record<string, unknown>)?.label;
      if (typeof label !== "string") continue;
      // Guard against null/undefined coordinates — some fixture
      // points may be "label-only" markers that the engine renders
      // without a spatial position. Indexing null[0] would throw
      // "Cannot read properties of null (reading '0')".
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const [lng, lat] = coords as [number, number];
      if (typeof lng !== "number" || typeof lat !== "number") continue;
      map.set(label.toLowerCase(), [lng, lat]);
    }
    return map;
  }, []);

  const handleStopSelect = React.useCallback(
    (stop: WorkspaceStop) => {
      const slug = stop.label.toLowerCase();
      const coords = stop.coordinates ?? labelCoords.get(slug);
      if (!coords) return;
      // Use the slug as the active stop id — matches the ?focus=
      // convention so the workspace and the home bento agree on what
      // is "selected".
      selectStop(slug, coords);
      router.push(publicDestinationDraftUrl(destination.slug));
    },
    [selectStop, labelCoords, router, destination.slug]
  );

  const updateVibe = React.useCallback((vibe: "restorative" | "balanced" | "high_energy") => {
    router.replace(publicDestinationDraftUrl(destination.slug, 7, vibe));
  }, [router, destination.slug]);

  return (
    <>
      {/* === Top-left: timeline panel === */}
      <div
        data-testid="workspace-timeline-panel"
        className="absolute top-6 left-6 z-10 w-80 md:w-96 rota-glass-panel rounded-[20px] border border-white/40 p-card-padding"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center font-mono-micro text-mono-micro uppercase tracking-[0.2em] bg-olive-dark/55 text-ochre-light px-2 py-1 rounded backdrop-blur-sm">
            Day 3 of 7
          </span>
          <span className="inline-flex items-center font-mono-micro text-mono-micro uppercase tracking-[0.2em] bg-olive-dark/55 text-ochre-light px-2 py-1 rounded backdrop-blur-sm">
            {destination.label}
          </span>
        </div>

        <h2 className="font-display italic text-2xl md:text-3xl text-primary leading-tight mb-2">
          A route worth taking slowly
        </h2>
        <p className="text-on-surface-variant leading-loose text-sm leading-relaxed mb-5">
          A seven-day preview shaped around place, pace, and the stops that connect naturally.
        </p>

        <div data-testid="workspace-refinement-pills" className="grid gap-2">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-1">
            Pace &amp; Tone
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill
              selected={paceTone.pace === "Relaxed"}
              onClick={() => { setPaceTone({ ...paceTone, pace: "Relaxed" }); updateVibe("restorative"); }}
            >
              Relaxed
            </Pill>
            <Pill
              selected={paceTone.pace === "Active"}
              onClick={() => { setPaceTone({ ...paceTone, pace: "Active" }); updateVibe("high_energy"); }}
            >
              Active
            </Pill>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill
              selected={paceTone.tone === "Hidden Gems"}
              onClick={() => { setPaceTone({ ...paceTone, tone: "Hidden Gems" }); updateVibe("restorative"); }}
            >
              Hidden Gems
            </Pill>
            <Pill
              selected={paceTone.tone === "Classics"}
              onClick={() => { setPaceTone({ ...paceTone, tone: "Classics" }); updateVibe("balanced"); }}
            >
              Classics
            </Pill>
          </div>
        </div>
      </div>

      {/* === Top-right: vertical icon column === */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <IconButton ariaLabel="Share trip" icon="ios_share" />
        <IconButton ariaLabel="Download trip" icon="download" />
      </div>

      {/* === Bottom: stop-card filmstrip === */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6">
          <div className="flex items-center justify-between mb-3 px-2">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light">
            Today's Stops
          </p>
          <Link
            href={publicDestinationDraftUrl(destination.slug)}
            className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light hover:text-ochre-dark transition-colors"
          >
            Plan this route →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" data-testid="workspace-filmstrip">
          {stops.map((stop, index) => {
            // Mock 1.4: the middle card is the "next/active" stop.
            // We resolve it to the order-2 stop (per spec).
            const isActive = index === 1;
            return (
              <article
                key={stop.label}
                data-stop-slug={stop.label.toLowerCase()}
                onClick={() => handleStopSelect(stop)}
                data-testid={
                  isActive ? "workspace-stop-card-active" : "workspace-stop-card"
                }
                className={[
                  "relative min-w-[300px] rounded-2xl p-card-padding cursor-pointer transition-transform hover:-translate-y-0.5",
                  isActive
                    ? "bg-olive-dark/90 backdrop-blur-md border border-olive-dark/15 text-on-primary"
                    : "rota-glass-panel border border-white/40 text-primary"
                ].join(" ")}
              >
                {isActive ? (
                  <span className="absolute top-0 left-0 right-0 h-1 bg-ochre-light rounded-t-2xl" />
                ) : null}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={[
                      "font-mono-micro text-mono-micro uppercase tracking-[0.2em]",
                      isActive ? "text-ochre-light" : "text-ochre-dark"
                    ].join(" ")}
                  >
                    {stop.scheduledTime}
                  </span>
                  <span
                    className={[
                      "font-mono-micro text-mono-micro uppercase tracking-[0.2em]",
                      isActive ? "text-primary-fixed-dim" : "text-olive-light"
                    ].join(" ")}
                  >
                    Stop {stop.order}
                  </span>
                </div>
                <h3
                  className={[
                    "font-headline-sm text-headline-sm leading-tight mb-1",
                    isActive ? "italic" : ""
                  ].join(" ")}
                >
                  {stop.label}
                </h3>
                <p
                  className={[
                    "text-sm leading-relaxed",
                    isActive ? "text-on-primary opacity-90" : "text-on-surface-variant leading-loose"
                  ].join(" ")}
                >
                  {stop.note}
                </p>
              </article>
            );
          })}

          {/* Add Stop — dashed accent tile at the end of the strip. */}
          <button
            type="button"
            aria-label="Add a new stop to today"
            data-testid="workspace-add-stop"
            className="group min-w-[180px] rounded-2xl border-2 border-dashed border-outline-variant bg-white/30 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-ochre-dark hover:bg-white/50 transition-colors"
          >
            <span className="ph text-3xl ph-plus" aria-hidden="true">plus</span>
            <span className="font-mono-micro text-mono-micro uppercase tracking-[0.2em]">
              Add Stop
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

interface PillProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Pill({ selected, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors",
        selected
          ? "bg-olive-dark text-linen-dark border border-olive-dark shadow-sm"
          : "bg-white/50 text-on-surface-variant border border-outline-variant hover:bg-white/80"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

interface IconButtonProps {
  ariaLabel: string;
  icon: string;
}

function IconButton({ ariaLabel, icon }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="w-12 h-12 rounded-full bg-glass-light/85 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-sm hover:bg-white transition-colors text-primary"
    >
      <span className="ph text-[22px]" aria-hidden="true">{icon}</span>
    </button>
  );
}
