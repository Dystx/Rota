"use client";

import * as React from "react";
import Link from "next/link";
import { useMapStore } from "@/store/useMapStore";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * HeroSearchWizard — the glass-card overlay at the bottom of the
 * home hero. Interactive in three ways:
 *
 *   1. The LOCATION chip is editable. Click → input. Type a new
 *      place (Portugal, Lisbon, Porto, Douro, Sintra, Cascais,
 *      Coimbra, Algarve, Azores — or anything else). On commit
 *      (Enter or blur), the chip tries to match the value against
 *      the spatial-engine's `DESTINATION_PRESETS`. If a match is
 *      found, the camera flies there; if not, the text is kept
 *      and a small hint shows that the map didn't move.
 *   2. The DAYS chip is editable. Click → number input. Enter a
 *      new day count. The map doesn't move (no spatial meaning)
 *      but the Begin Journey CTA passes the new value to /planner.
 *   3. The Begin Journey CTA navigates to /planner with the
 *      current location + days in the URL.
 *
 * The same `selectStop` action is what the destination bento uses,
 * so the chip + the bento share a single camera behavior.
 */

// 9 Portugal regions + a wide-zoom country view. The wide-zoom
// entry isn't a real preset — it's special-cased to the Iberian
// centroid + zoom 5.6, which is what the hero defaults to.
const WIDE_ZOOM_ENTRIES: Record<string, { center: readonly [number, number]; zoom: number }> = {
  // Match the hero's default focus so clicking "Portugal" doesn't
  // jolt the camera on first click. The preset's destination-level
  // zoom is intentionally lower (5.6) for the bento path; the
  // hero's "Portugal" chip should match the initial landing zoom.
  portugal: { center: [-8.3, 39.8], zoom: 6.5 },
  iberia: { center: [-8.3, 39.8], zoom: 6.5 },
  "iberian peninsula": { center: [-8.3, 39.8], zoom: 6.5 }
};

type FlyResult =
  | { kind: "match"; slug: string; center: readonly [number, number]; zoom: number; display: string }
  | { kind: "wide"; center: readonly [number, number]; zoom: number; display: string }
  | { kind: "nomatch"; display: string };

function resolveLocation(raw: string): FlyResult {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "nomatch", display: raw };
  const lower = trimmed.toLowerCase();

  // 1. Wide-zoom special cases (country / region)
  if (WIDE_ZOOM_ENTRIES[lower]) {
    return {
      kind: "wide",
      center: WIDE_ZOOM_ENTRIES[lower].center,
      zoom: WIDE_ZOOM_ENTRIES[lower].zoom,
      display: trimmed.replace(/\b\w/g, (c) => c.toUpperCase())
    };
  }

  // 2. Direct preset match (case-insensitive slug or name)
  const known = ["lisbon", "porto", "douro", "sintra", "cascais", "coimbra", "algarve", "azores"];
  for (const slug of known) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug === lower || preset.name.toLowerCase() === lower) {
      return {
        kind: "match",
        slug: preset.slug,
        center: [preset.camera.center[0], preset.camera.center[1]],
        zoom: preset.camera.zoom ?? 5.6,
        display: preset.name
      };
    }
  }

  // 3. Substring match: any known destination whose slug OR name
  // contains the input wins. Prefers slug-contains-name over
  // name-contains-slug to keep the typing experience predictable
  // ("port" → porto, not "douro valley").
  for (const slug of known) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug.includes(lower) || preset.name.toLowerCase().includes(lower)) {
      return {
        kind: "match",
        slug: preset.slug,
        center: [preset.camera.center[0], preset.camera.center[1]],
        zoom: preset.camera.zoom ?? 5.6,
        display: preset.name
      };
    }
  }

  return { kind: "nomatch", display: trimmed };
}

export function HeroSearchWizard() {
  const selectStop = useMapStore((state) => state.selectStop);
  const activeStopId = useMapStore((state) => state.activeStopId);

  const [location, setLocation] = React.useState("Portugal");
  const [days, setDays] = React.useState(7);
  const [editingLocation, setEditingLocation] = React.useState(false);
  const [editingDays, setEditingDays] = React.useState(false);
  const [draftLocation, setDraftLocation] = React.useState("Portugal");
  const [draftDays, setDraftDays] = React.useState("7");
  const [hint, setHint] = React.useState<string | null>(null);

  const commitLocation = React.useCallback(() => {
    setEditingLocation(false);
    if (draftLocation.trim() === "") {
      // Empty input — keep the prior value, flash a hint.
      setDraftLocation(location);
      setHint("Type a place to focus the map (try Portugal, Lisbon, Porto, Douro, Azores…)");
      window.setTimeout(() => setHint(null), 4000);
      return;
    }
    const result = resolveLocation(draftLocation);
    setLocation(result.display);
    setDraftLocation(result.display);
    if (result.kind === "nomatch") {
      // No match — keep the text but don't fly.
      setHint(
        `“${result.display}” isn't on our map yet — try Portugal, Lisbon, Porto, Douro, Sintra, Cascais, Coimbra, Algarve, or Azores.`
      );
      window.setTimeout(() => setHint(null), 5000);
    } else {
      setHint(null);
      selectStop(result.kind === "wide" ? "portugal" : result.slug, result.center);
    }
  }, [draftLocation, location, selectStop]);

  const commitDays = React.useCallback(() => {
    setEditingDays(false);
    const parsed = parseInt(draftDays, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 60) {
      setDays(parsed);
      setDraftDays(String(parsed));
    } else {
      setDraftDays(String(days));
    }
  }, [draftDays, days]);

  const plannerHref = React.useMemo(
    () => `/planner?destination=${encodeURIComponent(location.toLowerCase())}&days=${days}`,
    [location, days]
  );

  return (
    <div className="relative w-full max-w-2xl bg-glass-light/85 backdrop-blur-md border border-white/30 rounded-full px-4 py-2.5 md:px-5 md:py-3 shadow-md flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      <span className="font-body-md text-body-md md:font-headline-sm md:text-headline-sm text-primary text-center flex flex-wrap items-center justify-center gap-x-1.5">
        We are visiting{" "}
        <LocationChip
          value={location}
          isEditing={editingLocation}
          draft={draftLocation}
          onDraftChange={setDraftLocation}
          onCommit={commitLocation}
          onEdit={() => {
            setEditingLocation(true);
            setDraftLocation(location);
          }}
          onCancel={() => {
            setEditingLocation(false);
            setDraftLocation(location);
          }}
          active={activeStopId === "portugal" || ["lisbon", "porto", "douro", "sintra", "cascais", "coimbra", "algarve", "azores"].includes(activeStopId ?? "")}
          testId="hero-chip-portugal"
        />{" "}
        for{" "}
        <DaysChip
          value={days}
          isEditing={editingDays}
          draft={draftDays}
          onDraftChange={setDraftDays}
          onCommit={commitDays}
          onEdit={() => {
            setEditingDays(true);
            setDraftDays(String(days));
          }}
          onCancel={() => {
            setEditingDays(false);
            setDraftDays(String(days));
          }}
          testId="hero-chip-days"
        />
        ...
      </span>

      <Link
        href={plannerHref}
        data-testid="hero-begin-journey"
        className="bg-olive-light text-on-primary font-label-ui text-label-ui px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-olive-dark transition-all duration-200 shadow-sm flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
      >
        Begin{" "}
        <span className="material-symbols-outlined text-[14px] motion-safe:group-hover:translate-x-1 motion-safe:transition-transform" aria-hidden="true">
          arrow_forward
        </span>
      </Link>

      {/* Live hint — appears briefly when the typed value didn't
          resolve to a fly-to destination. Positioned absolutely
          below the pill so it never grows the card. */}
      {hint && (
        <div
          data-testid="hero-wizard-hint"
          role="status"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-md bg-ochre-light/20 border border-ochre-light/40 text-ochre-dark font-mono-technical text-[11px] text-center max-w-prose shadow-sm whitespace-nowrap"
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function LocationChip({
  value,
  isEditing,
  draft,
  onDraftChange,
  onCommit,
  onEdit,
  onCancel,
  active,
  testId
}: {
  value: string;
  isEditing: boolean;
  draft: string;
  onDraftChange: (next: string) => void;
  onCommit: () => void;
  onEdit: () => void;
  onCancel: () => void;
  active: boolean;
  testId: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1.5 align-baseline text-ochre-dark border-b-2 border-ochre-dark bg-ochre-light/15 shadow-sm px-1 -mx-1 rounded-sm">
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
          edit
        </span>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCommit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          aria-label="Destination"
          data-testid={`${testId}-input`}
          className="bg-transparent border-none focus:ring-0 outline-none font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-ochre-dark w-32 md:w-44 text-center p-0"
          size={Math.max(draft.length, 8)}
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      data-testid={testId}
      aria-label={`Edit destination — currently ${value}`}
      className={
        "inline-flex items-center gap-1.5 align-baseline text-ochre-dark border-b-2 transition-all duration-200 px-1 -mx-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
        (active
          ? "border-ochre-dark bg-ochre-light/20 shadow-sm"
          : "border-ochre-dark/30 hover:border-ochre-dark hover:bg-ochre-light/10 cursor-pointer")
      }
    >
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        {active ? "my_location" : "place"}
      </span>
      <span className="underline decoration-ochre-dark/40 underline-offset-4">{value}</span>
      <span className="material-symbols-outlined text-[12px] opacity-50" aria-hidden="true">
        edit
      </span>
    </button>
  );
}

function DaysChip({
  value,
  isEditing,
  draft,
  onDraftChange,
  onCommit,
  onEdit,
  onCancel,
  testId
}: {
  value: number;
  isEditing: boolean;
  draft: string;
  onDraftChange: (next: string) => void;
  onCommit: () => void;
  onEdit: () => void;
  onCancel: () => void;
  testId: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1.5 align-baseline text-ochre-dark border-b-2 border-ochre-dark bg-ochre-light/15 shadow-sm px-1 -mx-1 rounded-sm">
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={60}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCommit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          aria-label="Number of days"
          data-testid={`${testId}-input`}
          className="bg-transparent border-none focus:ring-0 outline-none font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-ochre-dark w-16 text-center p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      data-testid={testId}
      aria-label={`Edit trip length — currently ${value} days`}
      className="inline-flex items-center gap-1.5 align-baseline text-ochre-dark border-b-2 border-ochre-dark/30 hover:border-ochre-dark transition-all duration-200 px-1 -mx-1 rounded-sm hover:bg-ochre-light/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
    >
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        calendar_month
      </span>
      <span className="underline decoration-ochre-dark/40 underline-offset-4">
        {value} days
      </span>
      <span className="material-symbols-outlined text-[12px] opacity-50" aria-hidden="true">
        edit
      </span>
    </button>
  );
}
