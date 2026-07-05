"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Field, Input } from "@repo/ui";
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
 * `@repo/ui` form-primitives. There are no "..." trailing dots.
 * Underneath the sentence sits a single `Button` ("Begin
 * Journey") — also from the shared UI kit.
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
      className="w-full max-w-3xl shadow-[0_8px_32px_rgba(24,28,28,0.18)]"
    >
      <CardContent className="p-6 md:p-8">
        <form
          onSubmit={onBegin}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-3 text-center font-display-mobile md:font-display text-2xl md:text-4xl text-[var(--color-foreground)] leading-tight w-full">
            <span>We are visiting</span>
            <Field
              label="Destination"
              htmlFor="hero-intent-destination"
              className="contents"
            >
              {(fieldProps) => (
                <Input
                  id={fieldProps.id}
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  aria-label="Destination"
                  data-testid="hero-intent-destination"
                  className="!w-40 md:!w-48 !inline-block !px-3 !py-1.5 !text-2xl md:!text-4xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/90 !text-[var(--color-ink)]"
                />
              )}
            </Field>
            <span>for</span>
            <Field
              label="Number of days"
              htmlFor="hero-intent-days"
              className="contents"
            >
              {(fieldProps) => (
                <Input
                  id={fieldProps.id}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={60}
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  aria-label="Number of days"
                  data-testid="hero-intent-days"
                  className="!w-16 md:!w-20 !inline-block !px-3 !py-1.5 !text-2xl md:!text-4xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/90 !text-[var(--color-ink)]"
                />
              )}
            </Field>
            <span>days in</span>
            <Field
              label="Travel window"
              htmlFor="hero-intent-window"
              className="contents"
            >
              {(fieldProps) => (
                <Input
                  id={fieldProps.id}
                  type="text"
                  value={window}
                  onChange={(event) => setWindow(event.target.value)}
                  aria-label="Travel window"
                  placeholder="May"
                  data-testid="hero-intent-window"
                  className="!w-32 md:!w-40 !inline-block !px-3 !py-1.5 !text-2xl md:!text-4xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/90 !placeholder:text-[var(--color-muted-foreground)] !text-[var(--color-ink)]"
                />
              )}
            </Field>
            <span>.</span>
          </div>
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
