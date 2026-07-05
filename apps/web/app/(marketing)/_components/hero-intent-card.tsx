"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * HeroIntentCard — inline editable trip summary overlaid on the
 * 3D map hero. The user said: "even the hero needs to have a
 * inline editable inputs without the ... dots. just integrate it
 * well with the map."
 *
 * Replaces the old `HeroQuickStart` search bar (which sat BELOW
 * the hero) with a single glass card that lives INSIDE the hero,
 * on top of the map. The card reads as natural language:
 *
 *     We are visiting  [Portugal]  for  [7]  days in  [May].
 *
 * Each bracketed field is an inline editable input. There are no
 * "..." trailing dots (the old reference had "for 7 days..." with
 * ellipsis — we drop them for a cleaner sentence). Underneath the
 * sentence sits a single "Begin Journey" CTA.
 *
 * On submit we navigate to /planner with the values as query
 * params, so the planner can pre-fill its first step (or skip
 * straight to step 2 in the collapsed-wizard model).
 */
const KNOWN_SLUGS = [
  "lisbon",
  "porto",
  "douro",
  "sintra",
  "cascais",
  "coimbra",
  "algarve",
  "azores",
] as const;

const WIDE_ZOOM_ENTRIES = new Set(["portugal", "iberia", "iberian peninsula"]);

function resolveDestinationSlug(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "portugal";
  const lower = trimmed.toLowerCase();

  if (WIDE_ZOOM_ENTRIES.has(lower)) return "portugal";

  if ((KNOWN_SLUGS as readonly string[]).includes(lower)) {
    return lower;
  }

  for (const slug of KNOWN_SLUGS) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug === lower || preset.name.toLowerCase() === lower) {
      return slug;
    }
  }

  for (const slug of KNOWN_SLUGS) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug.includes(lower) || preset.name.toLowerCase().includes(lower)) {
      return slug;
    }
  }

  return lower.replace(/\s+/g, "-");
}

export function HeroIntentCard() {
  const router = useRouter();
  const [destination, setDestination] = React.useState("Portugal");
  const [days, setDays] = React.useState("7");
  const [window, setWindow] = React.useState("May");

  const onBegin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = resolveDestinationSlug(destination);
    const daysNum = Math.max(1, Math.min(60, parseInt(days, 10) || 7));
    const params = new URLSearchParams({
      destination: slug,
      days: String(daysNum),
    });
    if (window.trim()) params.set("window", window.trim());
    router.push(`/planner?${params.toString()}`);
  };

  // Shared className for the inline editable fields. Transparent
  // background, ochre dashed underline, ochre text — they read
  // as part of the sentence until you click them.
  const fieldClass =
    "mx-1 bg-transparent border-0 border-b-2 border-dashed border-ochre-light/50 focus:border-ochre-light focus:outline-none text-ochre-light font-headline-lg text-headline-lg text-center min-w-0";

  return (
    <form
      onSubmit={onBegin}
      data-testid="hero-intent-card"
      className="w-full max-w-3xl bg-glass-light backdrop-blur-[24px] border border-white/40 rounded-xl p-card-padding md:p-6 shadow-2xl flex flex-col items-center gap-5"
    >
      <label className="font-headline-lg text-headline-lg text-primary text-center w-full">
        We are visiting{" "}
        <input
          type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          aria-label="Destination"
          data-testid="hero-intent-destination"
          className={`${fieldClass} w-32`}
        />{" "}
        for{" "}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={60}
          value={days}
          onChange={(event) => setDays(event.target.value)}
          aria-label="Number of days"
          data-testid="hero-intent-days"
          className={`${fieldClass} w-14`}
        />{" "}
        days in{" "}
        <input
          type="text"
          value={window}
          onChange={(event) => setWindow(event.target.value)}
          aria-label="Travel window"
          placeholder="May"
          data-testid="hero-intent-window"
          className={`${fieldClass} w-28`}
        />
        .
      </label>
      <button
        type="submit"
        data-testid="hero-intent-submit"
        className="bg-olive-light text-on-primary font-label-ui text-label-ui px-8 py-3 rounded-full hover:bg-olive-dark transition-all duration-200 shadow-md flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
      >
        Begin Journey{" "}
        <span
          aria-hidden
          className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform"
        >
          arrow_forward
        </span>
      </button>
    </form>
  );
}
