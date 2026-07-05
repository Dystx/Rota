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

  // Shared className for the inline editable fields. Dark
  // olive pill background with light ochre text — high
  // contrast against the white card. On focus the pill
  // darkens so it's obvious which field is being edited.
  const fieldClass =
    "mx-1.5 px-3 py-1.5 bg-olive-dark rounded-md border-b-2 border-ochre-light focus:border-ochre-light focus:bg-primary focus:outline-none text-ochre-light font-display-mobile md:font-display text-2xl md:text-4xl text-center min-w-0 transition-colors placeholder:text-ochre-light/50";

  return (
    <form
      onSubmit={onBegin}
      data-testid="hero-intent-card"
      // Higher-contrast glass: stronger backdrop-blur + white
      // border at higher opacity so the card reads as a clear
      // surface over the busy 3D map. The previous glass-light
      // (border-white/40) was getting lost.
      className="w-full max-w-3xl bg-white/90 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-card-padding md:p-8 shadow-2xl flex flex-col items-center gap-6"
    >
      <label className="font-display-mobile md:font-display text-2xl md:text-4xl text-primary leading-tight text-center w-full">
        We are visiting{" "}
        <input
          type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          aria-label="Destination"
          data-testid="hero-intent-destination"
          className={`${fieldClass} w-36 md:w-44`}
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
          className={`${fieldClass} w-16 md:w-20`}
        />{" "}
        days in{" "}
        <input
          type="text"
          value={window}
          onChange={(event) => setWindow(event.target.value)}
          aria-label="Travel window"
          placeholder="May"
          data-testid="hero-intent-window"
          className={`${fieldClass} w-32 md:w-40`}
        />
        .
      </label>
      <button
        type="submit"
        data-testid="hero-intent-submit"
        // Larger, higher-contrast CTA. The previous olive-light
        // button was getting lost against the white card; olive-dark
        // gives it the presence a primary CTA needs.
        className="bg-olive-dark text-on-primary font-label-ui text-label-ui px-10 py-4 rounded-full hover:bg-olive-light transition-all duration-200 shadow-lg flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 text-lg"
      >
        Begin Journey{" "}
        <span
          aria-hidden
          className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform"
        >
          arrow_forward
        </span>
      </button>
    </form>
  );
}
