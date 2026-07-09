"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * HeroQuickStart — single-field search that sits between the 3D
 * map hero and the bento on the home page.
 *
 * The user said: "i dont want any forms everything should be 1 or
 * 2 clicks or write 1 or 2 words. sequencial." The bento is the
 * 1-click path; this is the 1-2-words path. A single field, no
 * chips, no Begin button — pressing Enter navigates to the
 * planner.
 *
 * The destination slug is resolved the same way the old
 * HeroSearchWizard resolved it: 8 destination presets (lisbon,
 * porto, douro, sintra, cascais, coimbra, algarve, azores), plus
 * 3 wide-zoom special cases (portugal, iberia, iberian
 * peninsula). Unknown inputs still navigate to the planner —
 * the planner's sequential wizard will refine from there.
 */
const WIDE_ZOOM_ENTRIES = new Set(["portugal", "iberia", "iberian peninsula"]);

const KNOWN_SLUGS = [
  "lisbon",
  "porto",
  "douro",
  "sintra",
  "cascais",
  "coimbra",
  "algarve",
  "azores"
] as const;

function resolveDestinationSlug(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "portugal";
  const lower = trimmed.toLowerCase();

  if (WIDE_ZOOM_ENTRIES.has(lower)) return "portugal";

  // Exact slug match.
  if ((KNOWN_SLUGS as readonly string[]).includes(lower)) {
    return lower;
  }

  // Slug or name match against the preset.
  for (const slug of KNOWN_SLUGS) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug === lower || preset.name.toLowerCase() === lower) {
      return slug;
    }
  }

  // Substring match.
  for (const slug of KNOWN_SLUGS) {
    const preset = getDestinationPreset(slug);
    if (!preset?.camera?.center) continue;
    if (preset.slug.includes(lower) || preset.name.toLowerCase().includes(lower)) {
      return slug;
    }
  }

  // Unknown destination — pass through as the slug. The
  // planner's first step will let the user confirm.
  return lower.replace(/\s+/g, "-");
}

export function HeroQuickStart() {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = resolveDestinationSlug(value);
    router.push(`/planner?destination=${encodeURIComponent(slug)}&days=7`);
  };

  return (
    <section className="bg-background">
      <div className="max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap">
        <form
          onSubmit={onSubmit}
          data-testid="hero-quick-start"
          className="flex items-center gap-2 rounded-full border border-olive-light/30 bg-white/80 backdrop-blur-md shadow-sm focus-within:border-ochre-light focus-within:ring-2 focus-within:ring-ochre-light/40 transition-all"
        >
          <span
            aria-hidden
            className="ph text-on-surface-variant pl-4 ph-magnifying-glass"
          >magnifying-glass</span>
          <label htmlFor="hero-quick-start-input" className="sr-only">
            Where are you going?
          </label>
          <input
            id="hero-quick-start-input"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Where are you going? Try Portugal, Lisbon, or the Azores…"
            data-testid="hero-quick-start-input"
            className="flex-1 bg-transparent font-body-md text-body-md text-primary placeholder:text-on-surface-variant/70 px-2 py-3 focus:outline-none"
          />
          <button
            type="submit"
            data-testid="hero-quick-start-submit"
            aria-label="Begin planning"
            className="inline-flex items-center gap-1.5 mr-2 px-4 py-1.5 rounded-full bg-olive-light text-on-primary font-label-ui text-label-ui hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Begin
            <span aria-hidden className="ph text-[14px] ph-arrow-right">arrow-right</span>
          </button>
        </form>
        <p className="mt-3 font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant text-center">
          Or pick a destination below
        </p>
      </div>
    </section>
  );
}
