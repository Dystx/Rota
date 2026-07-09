"use client";

import { useState } from "react";
import type { TripDraftListItem } from "@repo/db";

interface VaultCard {
  id: string;
  title: string;
  subtitle: string;
  badge: "Itinerary" | "Draft" | "Inspiration";
  days: string;
  imageSeed: string;
}

const toCard = (trip: TripDraftListItem): VaultCard => ({
  id: trip.id,
  title: trip.title || "Untitled trip",
  subtitle: [trip.brief?.destinationCountry, trip.brief?.regions?.[0]].filter(Boolean).join(" · ") || "Saved itinerary",
  badge: trip.status === "draft" ? "Draft" : "Itinerary",
  days: `${trip.brief?.tripLengthDays ?? 0} DAYS • ${trip.brief?.travelersCount ?? 1} ${trip.brief?.travelersCount === 1 ? "TRAVELER" : "TRAVELERS"}`,
  imageSeed: trip.id,
});

/**
 * Vault gallery + sliding export drawer (1.7 reference parity).
 *
 * Reference: docs/reference/rumia-console/1.7-saved-vault-export.html
 *
 * The drawer slides in from the right when a card is clicked. Pressing
 * Escape, the close button, or clicking the scrim closes it. The drawer's
 * "Selected Itinerary" card echoes the clicked card so the user can see
 * which trip the export will act on.
 */
export function VaultGallery({ trips }: { trips: TripDraftListItem[] }) {
  const CARDS = trips.map(toCard);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const selected = CARDS.find((c) => c.id === openCardId) ?? null;
  const isOpen = openCardId !== null;

  const close = () => setOpenCardId(null);

  return (
    <>
      {/* Gallery grid */}
      <section className="flex-grow flex flex-col gap-section-gap">
        <header className="flex justify-between items-end pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary">
              Saved Vault
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Your personalized archive of curated itineraries and
              inspirations.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Grid view"
              className="p-2 rounded-full hover:bg-surface-variant text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              <span className="ph" aria-hidden="true">
                grid_view
              </span>
            </button>
            <button
              type="button"
              aria-label="List view"
              className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              <span className="ph" aria-hidden="true">
                view_list
              </span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {CARDS.length === 0 ? (
            <div data-testid="vault-empty" className="rounded-xl border border-olive-light/20 bg-glass-light/60 p-card-padding text-center">
              <p className="font-headline-md text-headline-md text-primary">Your vault is empty</p>
              <p className="mt-2 text-on-surface-variant">Plan a trip to save an itinerary here.</p>
            </div>
          ) : CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setOpenCardId(card.id)}
              className="text-left bg-glass-light/65 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              aria-label={`Open export options for ${card.title}`}
            >
              <div className="h-48 w-full bg-surface-variant overflow-hidden relative">
                <div
                  className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: "url('/trip-covers/porto-ribeira.svg')",
                  }}
                />
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-primary font-mono-micro text-mono-micro uppercase tracking-wider">
                  {card.badge}
                </div>
              </div>
              <div className="p-card-padding">
                <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                  {card.title}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">
                  {card.subtitle}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                  <span className="font-mono-micro text-mono-micro text-on-surface-variant">
                    {card.days}
                  </span>
                  <span
                    className="ph text-on-surface-variant group-hover:text-ochre-dark transition-colors ph-arrow-right"
                    aria-hidden="true"
                  >arrow-right</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Scrim (mobile/tablet only) */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close export panel"
          onClick={close}
          className="md:hidden fixed inset-0 z-30 bg-olive-dark/40 backdrop-blur-sm cursor-default"
        />
      )}

      {/* Sliding export drawer (1.7 reference) */}
      <aside
        className={
          "fixed top-0 right-0 z-40 h-full w-full sm:w-96 bg-glass-light/85 backdrop-blur-xl border-l border-white/30 shadow-2xl p-card-padding overflow-y-auto transition-transform duration-300 ease-out " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
        aria-hidden={!isOpen}
        aria-label="Export options"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Export Options
          </h3>
          <button
            type="button"
            aria-label="Close export panel"
            onClick={close}
            className="text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded"
          >
            <span className="ph ph-x" aria-hidden="true">x</span>
          </button>
        </div>

        <div className="mb-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
          <h4 className="font-headline-sm text-headline-sm text-primary text-sm mb-1">
            {selected?.title ?? "No itinerary selected"}
          </h4>
          <p className="font-mono-micro text-mono-micro text-on-surface-variant uppercase tracking-wide">
            {selected ? "Selected Itinerary" : "Pick a card from your vault"}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            disabled={!selected}
            className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
              <span className="ph" aria-hidden="true">
                picture_as_pdf
              </span>
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Download PDF
              </div>
              <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                Premium editorial layout for printing or offline viewing.
              </div>
            </div>
          </button>
          <button
            type="button"
            disabled={!selected}
            className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
              <span className="ph" aria-hidden="true">
                sync_saved_locally
              </span>
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Sync to Mobile App
              </div>
              <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                Send directly to the Rumia companion app for on-the-go access.
              </div>
            </div>
          </button>
          <button
            type="button"
            disabled={!selected}
            className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
              <span className="ph" aria-hidden="true">
                share
              </span>
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Share Link
              </div>
              <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                Generate a secure web link to share with co-travelers.
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/30">
          <button
            type="button"
            disabled={!selected}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-ui text-label-ui shadow-sm hover:bg-olive-light hover:shadow-md transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <span
              className="ph text-sm"
              aria-hidden="true"
            >
              file_download
            </span>
            Execute Export
          </button>
        </div>
      </aside>
    </>
  );
}
