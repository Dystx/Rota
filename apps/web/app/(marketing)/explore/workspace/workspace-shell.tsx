"use client";

import * as React from "react";
import Link from "next/link";
import { useMapStore } from "@/store/useMapStore";
import { fixtureRouteCollection } from "@repo/spatial-engine";

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

interface PaceToneState {
  pace: "Relaxed" | "Active";
  tone: "Hidden Gems" | "Classics";
}

const DEFAULT_PACE_TONE: PaceToneState = {
  pace: "Relaxed",
  tone: "Hidden Gems"
};

/**
 * WorkspaceShell — overlays for mock 1.4 (Dynamic Workspace / Itinerary).
 * Floats three surfaces above the full-bleed map:
 *   - top-left: timeline panel (day pills + headline + Pace & Tone)
 *   - top-right: vertical column of share / download icon buttons
 *   - bottom:   horizontal filmstrip of stop cards + add-stop tile
 *
 * The refinement pills use local state (no remote wiring) so the
 * selected/unslected visual stays in sync with the mock.
 */
export function WorkspaceShell({ stops }: WorkspaceShellProps) {
  const [paceTone, setPaceTone] = React.useState<PaceToneState>(DEFAULT_PACE_TONE);
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
      const [lng, lat] = feature.geometry.coordinates as [number, number];
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
    },
    [selectStop, labelCoords]
  );

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
            Kyoto
          </span>
        </div>

        <h2 className="font-display italic text-2xl md:text-3xl text-primary leading-tight mb-2">
          The Artisan's Path
        </h2>
        <p className="rota-muted text-sm leading-relaxed mb-5">
          A 7-day journey shaped around craft — temples, tea houses, and the slow burn
          of a master at work.
        </p>

        <div data-testid="workspace-refinement-pills" className="grid gap-2">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-1">
            Pace &amp; Tone
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill
              selected={paceTone.pace === "Relaxed"}
              onClick={() => setPaceTone((s) => ({ ...s, pace: "Relaxed" }))}
            >
              Relaxed
            </Pill>
            <Pill
              selected={paceTone.pace === "Active"}
              onClick={() => setPaceTone((s) => ({ ...s, pace: "Active" }))}
            >
              Active
            </Pill>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill
              selected={paceTone.tone === "Hidden Gems"}
              onClick={() => setPaceTone((s) => ({ ...s, tone: "Hidden Gems" }))}
            >
              Hidden Gems
            </Pill>
            <Pill
              selected={paceTone.tone === "Classics"}
              onClick={() => setPaceTone((s) => ({ ...s, tone: "Classics" }))}
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
            href="#"
            className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light hover:text-ochre-dark transition-colors"
          >
            View all →
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
                    isActive ? "text-on-primary opacity-90" : "rota-muted"
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
            <span className="material-symbols-outlined text-3xl">add</span>
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
          ? "bg-ochre-light text-ochre-dark border border-ochre-light shadow-sm"
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
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </button>
  );
}
