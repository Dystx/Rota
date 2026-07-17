"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import type { TripDraftListItem } from "@repo/db";
import { DecisionStatePanel, Icon } from "@repo/ui";

interface VaultCard {
  id: string;
  title: string;
  subtitle: string;
  badge: "Chosen day" | "Draft" | "Inspiration";
  days: string;
  coverImage: string;
}

const COVER_BY_REGION: Record<string, string> = {
  alentejo: "/trip-covers/alentejo-plains.svg",
  algarve: "/trip-covers/algarve-coast.svg",
  aveiro: "/trip-covers/aveiro-canals.svg",
  azores: "/trip-covers/azores-craters.svg",
  cascais: "/trip-covers/cascais-coast.svg",
  coimbra: "/trip-covers/coimbra-uni.svg",
  douro: "/trip-covers/douro-vineyards.svg",
  lisbon: "/trip-covers/lisbon-tagus.svg",
  porto: "/trip-covers/porto-ribeira.svg",
  sintra: "/trip-covers/sintra-palace.svg"
};

function toCoverImage(trip: TripDraftListItem): string {
  const region = trip.brief?.regions?.[0]?.toLowerCase().replace(/\s+/g, "-");
  return (region && COVER_BY_REGION[region]) || "/trip-covers/porto-ribeira.svg";
}

const toCard = (trip: TripDraftListItem): VaultCard => ({
  id: trip.id,
  title: trip.title || "Untitled day",
  subtitle: [trip.brief?.destinationCountry, trip.brief?.regions?.[0]].filter(Boolean).join(" · ") || "Saved day",
  badge: trip.status === "draft" ? "Draft" : "Chosen day",
  days: `${trip.brief?.tripLengthDays ?? 0} DAYS • ${trip.brief?.travelersCount ?? 1} ${trip.brief?.travelersCount === 1 ? "TRAVELER" : "TRAVELERS"}`,
  coverImage: toCoverImage(trip),
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const selected = CARDS.find((c) => c.id === openCardId) ?? null;
  const isOpen = openCardId !== null;
  const isSingleGrid = view === "grid" && CARDS.length === 1;

  const close = () => setOpenCardId(null);

  return (
    <>
      {/* Gallery grid */}
      <section className="rumia-vault-gallery flex-grow flex flex-col gap-section-gap">
        <header className="rumia-vault-header flex justify-between items-end pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary">
              Saved days
            </h1>
            <p className="mt-2 text-base leading-7 text-on-surface-variant">
              Your private shelf of considered activity days, ready to revisit,
              reshape, or share.
            </p>
          </div>
          {CARDS.length > 0 ? (
            <div className="flex gap-2" aria-label="Saved day view">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                data-testid="vault-view-grid"
                onClick={() => setView("grid")}
                className={`min-h-11 min-w-11 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${view === "grid" ? "bg-primary text-linen-dark" : "text-on-surface-variant hover:bg-surface-variant"}`}
              >
                <Icon name="grid_view" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === "list"}
                data-testid="vault-view-list"
                onClick={() => setView("list")}
                className={`min-h-11 min-w-11 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${view === "list" ? "bg-primary text-linen-dark" : "text-on-surface-variant hover:bg-surface-variant"}`}
              >
                <Icon name="view_list" />
              </button>
            </div>
          ) : null}
        </header>

        <div
          className={
            CARDS.length === 0
              ? "grid grid-cols-1 gap-gutter"
              : isSingleGrid
                ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.64fr)] lg:items-stretch"
                : view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"
                  : "flex flex-col gap-gutter"
          }
        >
          {CARDS.length === 0 ? (
            <DecisionStatePanel
              data-testid="vault-empty"
              kind="empty"
              tone="inverse"
              className="rumia-vault-empty rounded-xl border-olive-light/20 px-6 py-12"
              title="Your vault is empty"
              description="Save a day when a route feels right. It will stay private here, ready to revisit, reshape, or share."
              illustration={<Icon name="bookmark-simple" aria-hidden />}
              primaryAction={(
                <Link
                  href="/planner"
                  className="inline-flex items-center justify-center rounded-full bg-ochre-light px-5 py-3 text-sm font-medium text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Shape a day
                </Link>
              )}
              secondaryAction={(
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-linen-dark transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Explore activities
                </Link>
              )}
            />
          ) : isSingleGrid ? (
            <>
              <div className="min-w-0">
                <VaultCardButton card={CARDS[0]!} view={view} onSelect={setOpenCardId} />
              </div>
              <VaultNextAction card={CARDS[0]!} />
            </>
          ) : (
            CARDS.map((card) => (
              <VaultCardButton key={card.id} card={card} view={view} onSelect={setOpenCardId} />
            ))
          )}
        </div>
      </section>

      {/* Scrim + drawer live inside a clipped viewport root so the closed
          translated panel cannot expand document scrollWidth. The dynamic
          viewport units also keep the panel aligned with mobile visual
          viewports when an authenticated shell reports a larger layout box. */}
      <div
        className={`fixed left-0 top-0 z-50 h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Scrim (mobile/tablet only) */}
        {isOpen && (
          <button
            type="button"
            aria-label="Close export panel"
            onClick={close}
            className="md:hidden absolute inset-0 z-30 bg-olive-dark/40 backdrop-blur-sm cursor-default"
          />
        )}

        {/* Sliding export drawer (1.7 reference) */}
        <aside
          className={
            "absolute top-0 right-0 z-40 h-full w-full sm:w-96 bg-glass-light/85 backdrop-blur-xl border-l border-white/30 shadow-2xl p-card-padding overflow-y-auto transition-transform duration-300 ease-out " +
            (isOpen ? "translate-x-0" : "translate-x-full")
          }
          aria-hidden={!isOpen}
          inert={!isOpen ? true : undefined}
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
            <Icon name="x" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
          <h4 className="font-headline-sm text-headline-sm text-primary text-sm mb-1">
            {selected?.title ?? "No chosen day selected"}
          </h4>
          <p className="font-mono-micro text-mono-micro text-on-surface-variant uppercase tracking-wide">
            {selected ? "Selected day" : "Pick a day from your vault"}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            disabled={!selected}
            className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
              <Icon name="picture_as_pdf" />
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Download PDF
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant">
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
              <Icon name="sync_saved_locally" />
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Offline copy (coming soon)
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant">
                A downloadable offline format will be available in a later release.
              </div>
            </div>
          </button>
          <button
            type="button"
            disabled={!selected}
            className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
              <Icon name="share" />
            </div>
            <div>
              <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                Share Link
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant">
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
            <Icon name="file_download" className="text-sm" />
            Execute Export
          </button>
        </div>
        </aside>
      </div>
    </>
  );
}

function VaultCardButton({
  card,
  view,
  onSelect
}: {
  card: VaultCard;
  view: "grid" | "list";
  onSelect: (cardId: string) => void;
}) {
  const isList = view === "list";

  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      data-testid={`vault-card-${card.id}`}
      className={`group relative w-full overflow-hidden rounded-xl border border-white/20 bg-glass-light/65 text-left shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${isList ? "grid grid-cols-[8rem_minmax(0,1fr)] sm:grid-cols-[12rem_minmax(0,1fr)]" : "grid grid-cols-1"}`}
      aria-label={`Open export options for ${card.title}`}
    >
      <div className={`relative w-full overflow-hidden bg-surface-variant ${isList ? "min-h-40 sm:min-h-44" : "h-48"}`} aria-hidden="true">
        <img
          src={card.coverImage}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 rounded bg-white/80 px-2 py-1 font-mono-micro text-mono-micro uppercase tracking-wider text-primary backdrop-blur-sm">
          {card.badge}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-between p-card-padding">
        <div>
          <h2 className="mb-1 font-headline-sm text-headline-sm text-primary">
            {card.title}
          </h2>
          <p className="mb-3 text-base leading-7 text-on-surface-variant">
            {card.subtitle}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4">
          <span className="font-mono-micro text-mono-micro text-on-surface-variant">
            {card.days}
          </span>
          <span className="inline-flex min-h-11 items-center gap-1 font-label-ui text-label-ui text-ochre-dark group-hover:underline">
            Open export options
            <Icon name="arrow-right" className="text-[16px]" />
          </span>
        </div>
      </div>
    </button>
  );
}

function VaultNextAction({ card }: { card: VaultCard }) {
  return (
    <aside
      data-testid="vault-next-action"
      className="flex h-full min-h-[20rem] flex-col justify-between gap-8 overflow-hidden rounded-[var(--radius-card)] bg-primary p-card-padding text-linen-dark shadow-raised lg:sticky lg:top-28"
      aria-labelledby="vault-next-action-heading"
    >
      <div className="grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
            One useful next step
          </p>
          <Icon name="arrow-up" aria-hidden className="text-ochre-light text-[20px]" />
        </div>
        <div className="grid gap-2">
          <h2 id="vault-next-action-heading" className="font-headline-lg text-headline-lg leading-tight">
            Keep the day close.
          </h2>
          <p className="max-w-prose font-body-md text-body-md leading-relaxed text-linen-dark/75">
            Reopen this saved plan when you want to compare its stops, carry its
            context into a new day, or prepare an export.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-linen-dark/55">
          Saved day in focus
        </p>
        <p className="font-headline-sm text-headline-sm text-linen-dark">
          {card.title}
        </p>
        <div className="grid gap-2 pt-2">
          <Link
            href={`/trip/${encodeURIComponent(card.id)}`}
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
