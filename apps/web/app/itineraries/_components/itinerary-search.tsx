"use client";

import * as React from "react";
import type { TripDraftListItem } from "@repo/db";
import { ItineraryExportDrawer } from "./itinerary-export-drawer";

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
 * Why client-side filter: the page is RSC-streamed from Supabase;
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
            <span
              aria-hidden
              className="ph absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] ph-magnifying-glass"
            >magnifying-glass</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, country, region, or interest…"
              data-testid="itinerary-search-input"
              className="w-full font-body-md text-body-md pl-11 pr-4 py-2.5 rounded-lg bg-white/70 border border-olive-light/30 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
            />
          </div>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            data-testid="itinerary-status-filter"
            className="font-body-md text-body-md px-4 py-2.5 rounded-lg bg-white/70 border border-olive-light/30 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
          >
            <option value="all">All statuses</option>
            <option value="draft">Drafts</option>
            <option value="paid">Unlocked</option>
            <option value="in_review">In review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </label>
      </div>

      <p
        data-testid="itinerary-result-count"
        className="font-mono-micro text-mono-micro text-on-surface-variant/70 mb-4"
      >
        {visible.length === trips.length
          ? `${trips.length} ${trips.length === 1 ? "itinerary" : "itineraries"}`
          : `${visible.length} of ${trips.length} ${trips.length === 1 ? "itinerary" : "itineraries"}`}
      </p>

      {visible.length === 0 ? (
        <div
          data-testid="itinerary-filtered-empty"
          className="bg-glass-light/40 border border-olive-light/20 rounded-xl p-card-padding text-center"
        >
          <p className="font-body-md text-body-md text-on-surface-variant">
            No itineraries match{" "}
            <span className="font-medium text-primary">"{query || statusFilter}"</span>
            . Try clearing the filter or planning a new trip.
          </p>
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter list-none p-0 m-0">
          {visible.map((trip) => (
            <li key={trip.id}>
              <ItineraryCard trip={trip} onSelect={setSelectedTrip} />
            </li>
          ))}
        </ul>
      )}

      <ItineraryExportDrawer
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
    </>
  );
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-olive-light/20 text-olive-dark",
  paid: "bg-ochre-light/20 text-ochre-dark",
  in_review: "bg-amber-100 text-amber-800",
  reviewed: "bg-emerald-100 text-emerald-800"
};

/**
 * Cover gradients — same palette as the account trip card so
 * the two archive surfaces read as siblings. Unknown regions
 * and id-collisions hash into a deterministic 8-colour
 * fallback so a 3-column grid always has visual variety.
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

const COVER_PALETTE: readonly string[] = [
  "linear-gradient(135deg, #B89878 0%, #7A5C3A 35%, #4A3622 75%, #1F1610 100%)",
  "linear-gradient(135deg, #C49542 0%, #8A6428 35%, #5C4520 75%, #2E2410 100%)",
  "linear-gradient(135deg, #6F8FA8 0%, #4A6F88 35%, #2E4A60 75%, #142838 100%)",
  "linear-gradient(135deg, #A87060 0%, #7A4838 35%, #4A2A20 75%, #1F1410 100%)",
  "linear-gradient(135deg, #7AB5C8 0%, #4A8FA8 35%, #2A6080 75%, #0F3D55 100%)",
  "linear-gradient(135deg, #8FB89E 0%, #5C8870 35%, #2E5848 75%, #143028 100%)",
  "linear-gradient(135deg, #C49542 0%, #8A6428 50%, #4A3618 100%)",
  "linear-gradient(135deg, #B89878 0%, #7A5C3A 50%, #3A2818 100%)"
] as const;

const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const coverGradient = (trip: TripDraftListItem): string => {
  const first = trip.brief?.regions?.[0]?.toLowerCase().replace(/\s+/g, "-");
  if (first && COVER_GRADIENTS[first]) return COVER_GRADIENTS[first];
  return COVER_PALETTE[hashString(trip.id) % COVER_PALETTE.length] ?? COVER_PALETTE[0] ?? "linear-gradient(135deg, #5A2A2E 0%, #3A2D1E 50%, #1A1410 100%)";
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
  const gradient = coverGradient(trip);
  return (
    <button
      type="button"
      onClick={() => onSelect(trip)}
      data-testid={`itinerary-card-${trip.id}`}
      aria-label={`Open export options for ${trip.title || "trip"}`}
      className="group block w-full text-left bg-glass-light backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
    >
      {/* Cover area — region-keyed gradient. 16:9 ratio so the
          card has a clear visual anchor and the grid doesn't
          feel like a CMS list. A subtle top→bottom dark overlay
          keeps the gradient's brighter zones from washing the
          title out. */}
      <div
        className="relative w-full aspect-[16/9]"
        style={{ background: gradient }}
        aria-hidden="true"
      >
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
          <span className="ph text-[16px] ph-share-network">share-network</span>
          Export &amp; share
          <span className="ph text-[16px] ph-arrow-right">arrow-right</span>
        </span>
      </div>
    </button>
  );
}
