"use client";

/**
 * Sliding export drawer for /itineraries (Stitch 1.7).
 *
 * - Slides in from the right when a card is selected
 * - Shows the selected itinerary summary + 3 export options
 *   (PDF, Calendar, Share Link) as radio-style cards
 * - "Execute Export" runs the selected option
 * - Closes on backdrop click, X button, or Escape key
 * - Locks body scroll while open and traps focus on the close
 *   button for keyboard users
 *
 * PDF: opens the trip page in a new tab. The trip page renders
 *   well in print; the user prints from there. (A future pass
 *   can wire a `?print=1` mode that auto-triggers window.print.)
 * Calendar: generates an .ics file client-side from the trip's
 *   startDate + tripLengthDays (or createdAt + days fallback)
 *   and triggers a download.
 * Share: copies the canonical trip URL to the clipboard and
 *   surfaces a transient inline toast.
 */

import * as React from "react";
import Link from "next/link";
import type { TripDraftListItem } from "@repo/db";

type ExportOption = "pdf" | "calendar" | "share";

const EXPORT_OPTIONS: Array<{
  id: ExportOption;
  icon: string;
  title: string;
  description: string;
}> = [
  {
    id: "pdf",
    icon: "picture_as_pdf",
    title: "Download PDF",
    description: "Premium editorial layout for printing or offline viewing.",
  },
  {
    id: "calendar",
    icon: "event",
    title: "Add to Calendar",
    description: "Generate a calendar event for the trip duration.",
  },
  {
    id: "share",
    icon: "link",
    title: "Share Link",
    description: "Copy a secure link to share with co-travelers.",
  },
];

export function ItineraryExportDrawer({
  trip,
  onClose,
}: {
  trip: TripDraftListItem | null;
  onClose: () => void;
}) {
  const [selected, setSelected] = React.useState<ExportOption>("pdf");
  const [toast, setToast] = React.useState<string | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const isOpen = trip !== null;

  // Lock body scroll while the drawer is open and focus the
  // close button for keyboard users.
  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close on Escape.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset the selected option and toast whenever a new trip is
  // opened so the drawer starts fresh each time.
  React.useEffect(() => {
    if (isOpen) {
      setSelected("pdf");
      setToast(null);
    }
  }, [isOpen, trip?.id]);

  // Auto-dismiss the inline toast.
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = React.useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleExecute = React.useCallback(() => {
    if (!trip) return;
    switch (selected) {
      case "pdf":
        // Open the trip's print-friendly view in a new tab AND
        // fire the browser print dialog immediately via ?print=1.
        // That gives the user a true 1-click PDF flow: the system
        // print dialog appears the moment the new tab loads, with
        // "Save as PDF" as a destination.
        window.open(
          `/trip/${trip.id}/export?view=print&print=1`,
          "_blank",
          "noopener,noreferrer"
        );
        showToast("Opening print dialog — choose Save as PDF.");
        break;
      case "calendar":
        downloadIcs(trip);
        showToast("Calendar file downloaded.");
        break;
      case "share":
        void copyShareLink(trip, showToast);
        break;
    }
  }, [selected, trip, showToast]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-olive-dark/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        data-testid="export-drawer-backdrop"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-drawer-title"
        data-testid="export-drawer"
        data-state={isOpen ? "open" : "closed"}
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-linen shadow-2xl border-l border-olive-light/30 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {trip ? <DrawerBody trip={trip} selected={selected} setSelected={setSelected} onClose={onClose} onExecute={handleExecute} toast={toast} closeButtonRef={closeButtonRef} /> : null}
      </aside>
    </div>
  );
}

function DrawerBody({
  trip,
  selected,
  setSelected,
  onClose,
  onExecute,
  toast,
  closeButtonRef,
}: {
  trip: TripDraftListItem;
  selected: ExportOption;
  setSelected: (id: ExportOption) => void;
  onClose: () => void;
  onExecute: () => void;
  toast: string | null;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const subtitle = [trip.brief?.destinationCountry, trip.brief?.regions?.[0]]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-olive-light/30">
        <h2
          id="export-drawer-title"
          className="font-headline-lg text-headline-lg text-primary"
        >
          Export Options
        </h2>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close export panel"
          data-testid="export-drawer-close"
          className="p-2 -mr-2 rounded-full text-on-surface-variant hover:bg-olive-light/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Selected itinerary summary */}
        <div
          data-testid="export-drawer-summary"
          className="mb-6 p-4 bg-olive-light/15 border border-olive-light/30 rounded-xl"
        >
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-olive-dark mb-1">
            Selected Itinerary
          </p>
          <h3 className="font-headline-md text-headline-md text-primary mb-1">
            {trip.title || "Untitled trip"}
          </h3>
          {subtitle ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
              {subtitle}
            </p>
          ) : null}
          <Link
            href={`/trip/${trip.id}`}
            className="inline-flex items-center gap-1 font-label-ui text-label-ui text-ochre-dark hover:underline"
          >
            View full trip
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Export options */}
        <fieldset>
          <legend className="sr-only">Export option</legend>
          <div className="space-y-3" data-testid="export-drawer-options">
            {EXPORT_OPTIONS.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <label
                  key={opt.id}
                  data-testid={`export-option-${opt.id}`}
                  data-selected={isSelected ? "true" : "false"}
                  className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-olive-light/15 border-olive-dark shadow-sm"
                      : "bg-white/60 border-olive-light/30 hover:border-olive-light/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="export-option"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setSelected(opt.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-olive-dark text-on-primary" : "bg-olive-light/30 text-olive-dark"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                  </span>
                  <span className="flex-1">
                    <span className="block font-label-ui text-label-ui text-primary mb-0.5">
                      {opt.title}
                    </span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">
                      {opt.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Footer with execute button */}
      <footer className="border-t border-olive-light/30 px-6 py-4 bg-linen">
        {toast ? (
          <div
            role="status"
            aria-live="polite"
            data-testid="export-drawer-toast"
            className="mb-3 px-3 py-2 rounded-lg bg-olive-dark/10 text-olive-dark font-body-sm text-body-sm"
          >
            {toast}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onExecute}
          data-testid="export-drawer-execute"
          className="w-full inline-flex items-center justify-center gap-2 bg-olive-dark text-on-primary font-label-ui text-label-ui px-6 py-3 rounded-lg hover:bg-olive-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Execute Export
        </button>
      </footer>
    </>
  );
}

// --- Export action helpers ---

async function copyShareLink(
  trip: TripDraftListItem,
  showToast: (msg: string) => void,
) {
  const url = `${window.location.origin}/trip/${trip.id}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard.");
      return;
    }
  } catch {
    // fall through to the legacy path
  }
  // Legacy fallback: a hidden textarea + execCommand for older browsers.
  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showToast("Link copied to clipboard.");
  } catch {
    showToast("Copy failed. The link is in your address bar.");
  } finally {
    document.body.removeChild(textarea);
  }
}

function downloadIcs(trip: TripDraftListItem) {
  const start = parseStartDate(trip);
  const days = trip.brief?.tripLengthDays ?? 3;
  // .ics VALUE=DATE is exclusive on DTEND, so add one extra day
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const dtstamp = formatIcsDateTime(new Date());
  const dtstart = formatIcsDate(start);
  const dtend = formatIcsDate(end);
  const uid = `${trip.id}@rota.travel`;
  const summary = escapeIcs(trip.title || "Trip");
  const description = escapeIcs(
    [
      trip.brief?.destinationCountry ?? "",
      (trip.brief?.regions ?? []).join(", "),
    ]
      .filter(Boolean)
      .join(" — "),
  );

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rota//Itinerary//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(trip.title || "trip")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseStartDate(trip: TripDraftListItem): Date {
  const fromBrief = trip.brief?.startDate;
  if (fromBrief && /^\d{4}-\d{2}-\d{2}$/.test(fromBrief)) {
    const d = new Date(`${fromBrief}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const created = new Date(trip.createdAt);
  if (!Number.isNaN(created.getTime())) return created;
  return new Date();
}

function formatIcsDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatIcsDateTime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "trip";
}
