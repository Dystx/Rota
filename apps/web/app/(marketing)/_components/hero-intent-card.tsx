"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@repo/ui";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * HeroIntentCard — inline editable trip summary overlaid on the
 * 3D map hero. The user said: "even the hero needs to have a
 * inline editable inputs without the ... dots. just integrate it
 * well with the map."
 *
 * Renders as a natural-language sentence:
 *
 *     We are visiting  [Portugal]  for  [7]  days in  [May].
 *
 * Each bracketed field is a plain `<input>` (NOT the shared
 * `Input` primitive — that one targets standalone form fields
 * with a white background, which reads as a broken form on the
 * dark hero). The inputs use a dark pill background with cream
 * text and an ochre underline so they sit inline with the
 * display-font sentence. Labels are visually hidden (sr-only)
 * so the sentence flows naturally; screen readers get the
 * field name via `aria-label`.
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

/**
 * Shared inline-input className for the hero sentence. Plain
 * <input> elements with explicit `appearance-none` so the
 * browser doesn't draw its own border/background. The dark
 * pill (bg-ink) + cream text (text-cream) + ochre underline
 * (border-b-2 border-ochre-light) reads as emphasized text
 * with a clear editable affordance, not a broken form field.
 */
const INLINE_FIELD_BASE =
  "inline-block appearance-none bg-ink text-cream border-0 border-b-2 border-ochre-light rounded-md px-2 py-0.5 md:px-3 md:py-1 text-center align-baseline mx-0.5 md:mx-1 font-display text-xl md:text-3xl leading-none transition-colors focus:outline-none focus:bg-primary focus:border-ochre-light focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-paper placeholder:text-cream/60";

const INLINE_FIELD_SIZES = {
  destination: "w-32 md:w-40",
  days: "w-14 md:w-16",
  window: "w-28 md:w-32",
} as const;

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

  return (
    <Card
      data-testid="hero-intent-card"
      className="on-dark w-full max-w-3xl shadow-[0_8px_32px_rgba(24,28,28,0.18)]"
    >
      <CardContent className="p-6 md:p-8">
        <form
          onSubmit={onBegin}
          className="flex flex-col items-center gap-6"
        >
          <label className="font-display text-xl md:text-3xl text-primary leading-snug text-center w-full text-balance">
            <span>We are visiting </span>
            <span className="sr-only">Destination</span>
            <input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              aria-label="Destination"
              data-testid="hero-intent-destination"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.destination}`}
            />
            <span> for </span>
            <span className="sr-only">Number of days</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              aria-label="Number of days"
              data-testid="hero-intent-days"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.days}`}
            />
            <span> days in </span>
            <span className="sr-only">Travel window</span>
            <input
              type="text"
              value={window}
              onChange={(event) => setWindow(event.target.value)}
              aria-label="Travel window"
              placeholder="May"
              data-testid="hero-intent-window"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.window}`}
            />
            <span>.</span>
          </label>
          <Button
            type="submit"
            data-testid="hero-intent-submit"
            className="!px-10 !py-4 !text-lg focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Begin Journey
            <span aria-hidden className="ph !text-[20px] ml-1 ph-arrow-right">arrow-right</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
