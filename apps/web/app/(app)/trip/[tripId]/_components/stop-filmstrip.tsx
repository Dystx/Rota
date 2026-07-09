"use client";

import { useMapStore } from "../../../../../store/useMapStore";

/**
 * StopFilmstrip — 1.4 reference: horizontal snap-x filmstrip of stops.
 *
 * Source: docs/reference/rumia-console/1.4-dynamic-workspace.html
 *
 * 300px-wide cards in a horizontal `snap-x snap-mandatory` container.
 * The active card uses the dark `glass-panel-dark` variant with a top
 * ochre-light bar and a "NEXT" pill; non-active cards use the light
 * `glass-panel-light` variant.
 *
 * Wiring: clicking a card sets `activeStopId` + `targetCoordinates` in
 * `useMapStore`. The store is also observed so the filmstrip highlight
 * tracks the map (future: when CinematicMapSection learns to write
 * `activeStopId` on feature click). The filmstrip scrolls the active
 * card into view on initial mount.
 */
export interface FilmstripStop {
  id: string;
  dayIndex: number;
  startTime: string;
  placeName: string;
  description?: string;
  durationHours?: number;
  imageSeed?: string;
  coordinates?: readonly [number, number];
}

export function StopFilmstrip({ stops }: { stops: FilmstripStop[] }) {
  const activeStopId = useMapStore((s) => s.activeStopId);
  const selectStop = useMapStore((s) => s.selectStop);

  if (stops.length === 0) return null;

  // The "next" stop is the first one after the active. If none is
  // active, the next-up is the first card.
  const activeIndex = activeStopId
    ? stops.findIndex((s) => s.id === activeStopId)
    : -1;
  const nextIndex = activeIndex >= 0 ? activeIndex + 1 : 0;
  const nextStopId = stops[nextIndex]?.id ?? null;

  return (
    <section
      className="w-full mt-auto pointer-events-auto"
      aria-label="Today's stops"
      data-testid="filmstrip-section"
    >
      <h2 className="font-headline-sm text-headline-sm text-primary mb-4 px-container-padding-lg drop-shadow-md">
        Today&apos;s Stops
      </h2>
      <div
        className="flex gap-gutter overflow-x-auto scrollbar-hide px-container-padding-lg pb-4 snap-x snap-mandatory"
        data-testid="filmstrip-track"
      >
        {stops.map((stop) => {
          const isActive = stop.id === activeStopId;
          const isNext = stop.id === nextStopId && stop.id !== activeStopId;
          const hasCoords = stop.coordinates !== undefined;
          return (
            <button
              key={stop.id}
              type="button"
              data-testid={`stop-card-${stop.id}`}
              onClick={() => {
                // Defence in depth: the `disabled` attribute
                // below already prevents the click when the
                // stop has no coordinates, but the explicit
                // guard makes the intent visible in the source
                // and gives TypeScript a narrow type for
                // `stop.coordinates` in the call below.
                if (!hasCoords) return;
                selectStop(stop.id, stop.coordinates as readonly [number, number]);
              }}
              disabled={!hasCoords}
              // `aria-pressed` is for toggle buttons. A
              // disabled card (no coordinates) isn't
              // togglable — it would be a confusing
              // signal. Omit `aria-pressed` on disabled cards.
              aria-pressed={hasCoords ? isActive : undefined}
              aria-label={
                hasCoords
                  ? `${stop.startTime} — ${stop.placeName}${
                      isActive ? " (current)" : isNext ? " (next up)" : ""
                    }`
                  : `${stop.startTime} — ${stop.placeName} (no map coordinates yet)`
              }
              className={
                "text-left min-w-[300px] w-[300px] rounded-xl overflow-hidden shadow-sm flex flex-col snap-center group transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light " +
                (isActive
                  ? "bg-glass-dark text-linen-dark border border-ochre-light/50 shadow-2xl relative transform scale-[1.02] cursor-pointer"
                  : hasCoords
                    ? "bg-glass-light text-primary border border-white/20 hover:-translate-y-1 cursor-pointer"
                    : "bg-glass-light/40 text-on-surface-variant/60 border border-white/10 cursor-not-allowed")
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 w-full h-1 bg-ochre-light"
                />
              )}
              <div className="h-32 w-full relative">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://picsum.photos/seed/${stop.imageSeed ?? stop.id}/400/200')`
                  }}
                />
                <div
                  className={
                    "absolute top-2 left-2 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono-micro font-bold " +
                    (isActive
                      ? "bg-ochre-light/90 text-olive-dark"
                      : "bg-white/90 text-primary")
                  }
                >
                  {isNext
                    ? `${stop.startTime} • NEXT`
                    : stop.startTime}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={
                      "font-headline-sm text-headline-sm leading-tight " +
                      (isActive ? "text-linen-dark" : "text-primary")
                    }
                  >
                    {stop.placeName}
                  </h3>
                  <span
                    aria-hidden="true"
                    className={
                      "transition-colors " +
                      (isActive
                        ? "text-primary-fixed-dim hover:text-ochre-light"
                        : "text-on-surface-variant hover:text-ochre-dark")
                    }
                  >
                    <span className="ph text-[18px]">
                      more_vert
                    </span>
                  </span>
                </div>
                {stop.description && (
                  <p
                    className={
                      "font-label-ui text-label-ui mb-3 line-clamp-2 " +
                      (isActive ? "text-primary-fixed-dim" : "text-on-surface-variant")
                    }
                  >
                    {stop.description}
                  </p>
                )}
                <div
                  className={
                    "mt-auto flex justify-between items-center border-t pt-3 " +
                    (isActive ? "border-white/10" : "border-olive-dark/10")
                  }
                >
                  {stop.durationHours !== undefined && (
                    <div
                      className={
                        "flex items-center gap-1 font-mono-micro " +
                        (isActive
                          ? "text-primary-fixed-dim"
                          : "text-on-surface-variant")
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="ph text-[14px] ph-calendar"
                      >calendar</span>
                      {stop.durationHours.toFixed(1)} hrs
                    </div>
                  )}
                  <span
                    className={
                      "font-label-ui text-label-ui hover:underline " +
                      (isActive
                        ? "bg-ochre-light text-olive-dark px-3 py-1 rounded-sm hover:bg-white transition-colors"
                        // `text-olive-dark` (#1D2A23) on the glass-light
                        // card surface hits ~13:1 contrast (WCAG AAA).
                        // `text-ochre-dark` (#CE933F) was 2.6:1 — fails
                        // WCAG AA. The @a11y audit caught it on the
                        // /trip/3 route once the filmstrip started
                        // shipping on the live page.
                        : "text-olive-dark")
                    }
                  >
                    {isActive ? "Navigate" : "Details"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
        {/* Stitch 1.4 — "Add Stop" card at the end of the filmstrip.
            Dashed border, + icon, links to the planner so the user
            can extend the trip. The card is decorative (the planner
            has its own form for adding stops); it surfaces the
            affordance and the visual rhythm of the row. */}
        <a
          href="/planner"
          data-testid="stop-card-add"
          aria-label="Add a new stop to this trip"
          className="text-left min-w-[300px] w-[300px] rounded-xl border-2 border-dashed border-olive-light/60 bg-white/30 hover:bg-white/50 hover:border-olive-dark/60 transition-colors flex flex-col items-center justify-center gap-2 text-olive-dark snap-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="w-12 h-12 rounded-full border-2 border-olive-light/60 flex items-center justify-center"
          >
            <span className="ph text-[24px] ph-plus">plus</span>
          </span>
          <span className="font-label-ui text-label-ui">Add Stop</span>
        </a>
      </div>
    </section>
  );
}
