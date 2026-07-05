"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Input } from "@repo/ui";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * HeroIntentCard — inline editable trip summary overlaid on the
 * 3D map hero. The user said: "even the hero needs to have a
 * inline editable inputs without the ... dots. just integrate it
 * well with the map."
 *
 * Replaces the old `HeroQuickStart` search bar (which sat BELOW
 * the hero) with a single Card that lives INSIDE the hero, at
 * the BOTTOM so the rotating globe stays fully visible above.
 * The card reads as natural language:
 *
 *     We are visiting  [Portugal]  for  [7]  days in  [May].
 *
 * Each bracketed field is an inline editable `Input` from
 * `@repo/ui`. Labels are visually hidden (sr-only) so the
 * sentence flows naturally on mobile and desktop; screen
 * readers get the field name via `aria-label`. Underneath the
 * sentence sits a single `Button` ("Begin Journey") — also
 * from the shared UI kit.
 *
 * On submit we navigate to /planner with the values as query
 * params, so the planner can pre-fill its first step.
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
 * Shared inline-input className. Labels are sr-only so the
 * sentence flows naturally; the visual sentence itself serves
 * as the label. High-contrast ochre underline + olive-dark
 * pill background so the inputs read clearly against the
 * white card.
 */
const INLINE_FIELD_BASE =
  "inline-block px-2 py-0.5 md:px-3 md:py-1 bg-[var(--color-foreground)] rounded-md border-b-2 border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:bg-[var(--color-primary)] focus:outline-none text-[var(--color-accent-light)] text-center align-baseline mx-0.5 md:mx-1 transition-colors placeholder:text-[var(--color-accent-light)]";

const INLINE_FIELD_SIZES = {
  destination: "!w-28 md:!w-40",
  days: "!w-12 md:!w-16",
  window: "!w-24 md:!w-32",
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
          {/* Sentence with inline editable fields. Each field is
              a raw <Input> (not wrapped in <Field>) so the label
              doesn't render above the input — the sentence
              itself is the visual label. `aria-label` gives
              screen readers the field name. */}
          <label className="font-display-mobile md:font-display text-xl md:text-3xl text-[var(--color-foreground)] leading-snug text-center w-full text-balance">
            <span>We are visiting </span>
            <span className="sr-only">Destination</span>
            <Input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              aria-label="Destination"
              data-testid="hero-intent-destination"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.destination} !text-xl md:!text-3xl !font-display-mobile md:!font-display`}
            />
            <span> for </span>
            <span className="sr-only">Number of days</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              aria-label="Number of days"
              data-testid="hero-intent-days"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.days} !text-xl md:!text-3xl !font-display-mobile md:!font-display`}
            />
            <span> days in </span>
            <span className="sr-only">Travel window</span>
            <Input
              type="text"
              value={window}
              onChange={(event) => setWindow(event.target.value)}
              aria-label="Travel window"
              placeholder="May"
              data-testid="hero-intent-window"
              className={`${INLINE_FIELD_BASE} ${INLINE_FIELD_SIZES.window} !text-xl md:!text-3xl !font-display-mobile md:!font-display`}
            />
            <span>.</span>
          </label>
          <Button
            type="submit"
            data-testid="hero-intent-submit"
            className="!px-10 !py-4 !text-lg shadow-[0_8px_24px_rgba(24,28,28,0.2)]"
          >
            Begin Journey
            <span aria-hidden className="material-symbols-outlined !text-[20px] ml-1">
              arrow_forward
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
