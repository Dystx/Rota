"use client";

import * as React from "react";
import Link from "next/link";
import type { TripDraftListItem } from "@repo/db";

/**
 * ItinerarySearch — small client island for the /itineraries page.
 *
 * Receives the full list from the server, holds the search query
 * and status filter in local state, and renders the matching rows
 * in the same card layout the page used before. Renders nothing
 * when the filter excludes everything (with a clear-empty hint).
 *
 * Why client-side filter: the page is RSC-streamed from Supabase;
 * pushing the filter through the server would require a router
 * round-trip on every keystroke. With 24 rows max the in-memory
 * filter is faster than the network.
 */
export function ItinerarySearch({ trips }: { trips: TripDraftListItem[] }) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "draft" | "paid" | "in_review" | "reviewed">("all");

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
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
            >
              search
            </span>
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
        {visible.length} of {trips.length}
        {visible.length === 1 ? " itinerary" : " itineraries"}
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
        <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-gutter list-none p-0 m-0">
          {visible.map((trip) => (
            <li key={trip.id}>
              <ItineraryCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-olive-light/20 text-olive-dark",
  paid: "bg-ochre-light/20 text-ochre-dark",
  in_review: "bg-amber-100 text-amber-800",
  reviewed: "bg-emerald-100 text-emerald-800"
};

function ItineraryCard({ trip }: { trip: TripDraftListItem }) {
  const statusTone = STATUS_TONE[trip.status] ?? "bg-olive-light/20 text-olive-dark";
  const subtitle = [
    trip.brief?.destinationCountry,
    trip.brief?.regions?.[0]
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/trip/${trip.id}`}
      data-testid={`itinerary-card-${trip.id}`}
      className="block bg-glass-light backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-mono-micro text-mono-micro uppercase tracking-widest px-2 py-0.5 rounded ${statusTone}`}
        >
          {trip.status.replace("_", " ")}
        </span>
        <span className="font-mono-micro text-mono-micro text-on-surface-variant/60">
          {trip.id}
        </span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
        {trip.title || "Untitled trip"}
      </h3>
      {subtitle && (
        <p className="font-body-md text-body-md text-on-surface-variant mb-3">
          {subtitle}
        </p>
      )}
      <span className="inline-flex items-center gap-1 font-label-ui text-label-ui text-ochre-dark hover:underline">
        Open trip
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </span>
    </Link>
  );
}
