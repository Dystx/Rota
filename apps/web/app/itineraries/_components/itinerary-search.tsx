"use client";

import * as React from "react";
import Link from "next/link";
import type { TripDraftListItem } from "@repo/db";
import { DecisionStatePanel, Icon } from "@repo/ui";
import { ItineraryExportDrawer } from "./itinerary-export-drawer";
import { resolveCoverImage } from "@/lib/trip-cover";

/**
 * ItinerarySearch — small client island for the /itineraries page.
 *
 * Receives the full list from the server, holds the search query
 * and status filter in local state, and renders the matching rows
 * in the same card layout the page used before. Renders nothing
 * when the filter excludes everything (with a clear-empty hint).
 *
 * Clicking a card opens the export drawer (Stitch 1.7) with
 * PDF / Calendar / Share options. The drawer is the primary
 * action surface for a saved trip; navigating to the full
 * trip page happens from inside the drawer.
 *
 * Why client-side filter: the page is RSC-streamed from PostgreSQL;
 * pushing the filter through the server would require a router
 * round-trip on every keystroke. With 24 rows max the in-memory
 * filter is faster than the network.
 */
export function ItinerarySearch({ trips }: { trips: TripDraftListItem[] }) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "draft" | "paid" | "in_review" | "reviewed">("all");
  const [selectedTrip, setSelectedTrip] = React.useState<TripDraftListItem | null>(null);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return trips.filter((trip) => {
      if (statusFilter !== "all" && trip.status !== statusFilter) {
        // "paid" is what the unlocked trips end up in; the
        // status enums in the schema are lowercase strings
        // ("draft", "paid", "in_review", "reviewed"), so the
        // equality check is direct.
        return false;
      }
      if (!q) return true;
      const haystack = [
        trip.title ?? "",
        trip.brief?.destinationCountry ?? "",
        (trip.brief?.regions ?? []).join(" "),
        trip.brief?.interests?.join(" ") ?? ""
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [trips, query, statusFilter]);

  return (
    <>
      <div
        data-testid="itinerary-search"
        className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <label className="flex-1">
          <span className="sr-only">Search itineraries</span>
          <div className="relative">
            <Icon name="magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search itineraries…"
              data-testid="itinerary-search-input"
              className="min-h-11 w-full font-body-md text-body-md pl-11 pr-4 py-2.5 rounded-lg bg-white/70 border border-olive-light/30 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
            />
          </div>
        </label>
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter itineraries by status" data-testid="itinerary-status-filter">
        {([['all','All'],['draft','Drafts'],['paid','Unlocked'],['in_review','In review'],['reviewed','Reviewed']] as const).map(([value,label]) => (
          <button key={value} type="button" onClick={() => setStatusFilter(value)} aria-pressed={statusFilter === value} data-testid={`itinerary-filter-${value}`} className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-colors ${statusFilter === value ? "border-olive-dark bg-olive-dark text-white" : "border-olive-light/30 bg-white/70 text-primary hover:bg-olive-light/10"}`}>
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <DecisionStatePanel
          data-testid="itinerary-filtered-empty"
          kind="empty"
          tone="inverse"
          className="rounded-xl border-white/20 px-6 py-12"
          title="No matching itineraries"
          description={`No itineraries match "${query || statusFilter}". Try clearing the filter or planning a new trip.`}
          illustration={<Icon name="magnifying-glass" aria-hidden />}
          primaryAction={(
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              data-testid="itinerary-clear-filters"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-ochre-light px-5 font-label-ui text-label-ui text-primary transition-colors hover:bg-ochre-light/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Clear filters
            </button>
          )}
          secondaryAction={(
            <Link
              href="/planner"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-linen-dark/30 px-5 font-label-ui text-label-ui text-linen-dark transition-colors hover:border-ochre-light hover:text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Plan a new trip
            </Link>
          )}
        >
        </DecisionStatePanel>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.64fr)] lg:items-stretch">
          <section className="min-w-0" aria-labelledby="itinerary-results-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2
                id="itinerary-results-heading"
                className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark"
              >
                Your saved work
              </h2>
              <p
                data-testid="itinerary-result-count"
                className="font-mono-micro text-mono-micro text-on-surface-variant"
              >
                {visible.length === trips.length
                  ? `${trips.length} ${trips.length === 1 ? "itinerary" : "itineraries"}`
                  : `${visible.length} of ${trips.length} ${trips.length === 1 ? "itinerary" : "itineraries"}`}
              </p>
            </div>
            <ul
              role="list"
              className={`grid grid-cols-1 ${visible.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"} gap-gutter list-none p-0 m-0`}
            >
              {visible.map((trip) => (
                <li key={trip.id}>
                  <ItineraryCard trip={trip} onSelect={setSelectedTrip} />
                </li>
              ))}
            </ul>
          </section>
          <ArchiveNextAction trip={visible[0] ?? trips[0]} />
        </div>
      )}

      <ItineraryExportDrawer
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
    </>
  );
}

function ArchiveNextAction({ trip }: { trip: TripDraftListItem | undefined }) {
  if (!trip) return null;

  return (
    <aside
      data-testid="itinerary-next-action"
      className="flex h-full min-h-[20rem] flex-col justify-between gap-8 overflow-hidden rounded-[var(--radius-card)] bg-primary p-card-padding text-linen-dark shadow-raised lg:sticky lg:top-28"
      aria-labelledby="itinerary-next-action-heading"
    >
      <div className="grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
            One useful next step
          </p>
          <Icon name="arrow-up" aria-hidden className="text-ochre-light text-[20px]" />
        </div>
        <div className="grid gap-2">
          <h2 id="itinerary-next-action-heading" className="font-headline-lg text-headline-lg leading-tight">
            Keep one day in hand.
          </h2>
          <p className="max-w-prose font-body-md text-body-md leading-relaxed text-linen-dark/75">
            Your archive is a starting point. Reopen the saved plan when you
            want to compare its stops, keep its context, or carry it into an
            export.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-linen-dark/55">
          Saved day in focus
        </p>
        <p className="font-headline-sm text-headline-sm text-linen-dark">
          {trip.title || "Untitled trip"}
        </p>
        <div className="grid gap-2 pt-2">
          <Link
            href={`/trip/${encodeURIComponent(trip.id)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ochre-light px-5 py-3 font-label-ui text-label-ui font-semibold text-primary transition-colors hover:bg-ochre-light/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Open saved plan
          </Link>
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-linen-dark/30 px-5 py-3 font-label-ui text-label-ui text-linen-dark transition-colors hover:border-ochre-light hover:text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Shape another day
          </Link>
        </div>
      </div>
    </aside>
  );
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-olive-light/20 text-olive-dark",
  paid: "bg-ochre-light/20 text-ochre-dark",
  in_review: "bg-amber-100 text-amber-800",
  reviewed: "bg-emerald-100 text-emerald-800"
};

/**
 * Per-region gradient fallback for the cover area. The manifest-backed local
 * artwork is the visible focal layer; the gradient remains underneath it so a
 * slow or unavailable image never leaves a blank archive card.
 */
const COVER_GRADIENTS: Record<string, string> = {
  lisbon: "linear-gradient(135deg, #F2C5A0 0%, #E08860 40%, #5A2A2E 85%, #1D2A23 100%)",
  porto: "linear-gradient(135deg, #D4A574 0%, #A87149 35%, #5C3826 75%, #2A1A14 100%)",
  douro: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)",
  azores: "linear-gradient(135deg, #6FA89E 0%, #3D7A6F 35%, #1F4A44 75%, #0D2624 100%)",
  algarve: "linear-gradient(135deg, #E8B86C 0%, #C49542 35%, #8A6428 75%, #4A3812 100%)",
  sintra: "linear-gradient(135deg, #A8B8C8 0%, #708090 35%, #4A5868 75%, #2A3440 100%)",
  cascais: "linear-gradient(135deg, #7AB5C8 0%, #4A8FA8 35%, #2A6080 75%, #0F3D55 100%)",
  coimbra: "linear-gradient(135deg, #C49542 0%, #8A6428 35%, #5C4520 75%, #2E2410 100%)",
  alentejo: "linear-gradient(135deg, #C9A876 0%, #8B7048 35%, #5C4828 75%, #2E2412 100%)",
  aveiro: "linear-gradient(135deg, #8FB8C8 0%, #5A8FA8 35%, #2E6080 75%, #143850 100%)",
  iberia: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)"
};

function ItineraryCard({
  trip,
  onSelect,
}: {
  trip: TripDraftListItem;
  onSelect: (trip: TripDraftListItem) => void;
}) {
  const statusTone = STATUS_TONE[trip.status] ?? "bg-olive-light/20 text-olive-dark";
  const subtitle = [
    trip.brief?.destinationCountry,
    trip.brief?.regions?.[0]
  ]
    .filter(Boolean)
    .join(" · ");
  const firstRegion = trip.brief?.regions?.[0]?.toLowerCase().replace(/\s+/g, "-");
  const gradient = (firstRegion && COVER_GRADIENTS[firstRegion])
    ?? COVER_GRADIENTS.iberia
    ?? "linear-gradient(135deg, #5A2A2E 0%, #3A2D1E 50%, #1A1410 100%)";
  const cover = resolveCoverImage(trip.brief);
  return (
    <button
      type="button"
      onClick={() => onSelect(trip)}
      data-testid={`itinerary-card-${trip.id}`}
      aria-label={`Open export options for ${trip.title || "trip"}`}
      className="group block w-full text-left bg-glass-light backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
    >
      {/* Cover area — local manifest-backed regional artwork over a
          deterministic gradient fallback. The 16:9 ratio keeps the card
          anchored in the archive grid without becoming a CMS list. */}
      <div
        className="relative w-full aspect-[16/9]"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        <img
          data-testid={`itinerary-card-cover-image-${trip.id}`}
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
        <span
          className={`absolute top-2.5 left-2.5 font-mono-micro text-mono-micro uppercase tracking-widest px-2 py-0.5 rounded ${statusTone}`}
        >
          {trip.status.replace("_", " ")}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
          {trip.title || "Untitled trip"}
        </h3>
        {subtitle && (
          <p className="font-body-md text-body-md text-on-surface-variant mb-3">
            {subtitle}
          </p>
        )}
        <span className="inline-flex items-center gap-1 font-label-ui text-label-ui text-ochre-dark group-hover:underline">
          <Icon name="share-network" className="text-[16px]" />
          Export &amp; share
          <Icon name="arrow-right" className="text-[16px]" />
        </span>
      </div>
    </button>
  );
}
