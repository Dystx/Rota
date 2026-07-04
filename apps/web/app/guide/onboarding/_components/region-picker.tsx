"use client";

/**
 * Region picker for the specialist onboarding form.
 *
 * Renders a checkbox grid of the 9 Portugal region slugs from
 * `portugalRegions` (see `packages/types/src/trip-brief.ts`).
 * The picker is slug-driven: the user sees friendly names,
 * the form stores the selected slugs in component state, and
 * the onChange callback receives the synthetic region UUIDs
 * (see `packages/types/src/region-ids.ts`) so the rest of
 * the pipeline (zod `z.string().uuid()`, the `regions_covered
 * UUID[]` column) is unchanged.
 *
 * Why slugs, not region UUIDs, are shown:
 *   The freeform "Region UUIDs" text input this replaces was
 *   unusable for a non-engineer. The plan for PR-11a is to
 *   give specialists a click-to-pick experience and let the
 *   `region-ids.ts` map translate at the boundary.
 *
 * When the `regions` table is normalized (PR-11d or a
 * follow-up), this component can re-point its source list
 * to a server-fetched query without changing the onChange
 * contract.
 */

import * as React from "react";
import {
  regionIdsBySlug,
  regionIdsToSlugs,
  slugsToRegionIds
} from "@repo/types";

const PORTUGAL_REGION_LABELS: Record<keyof typeof regionIdsBySlug, string> = {
  porto: "Porto",
  "douro-valley": "Douro Valley",
  lisbon: "Lisbon",
  sintra: "Sintra",
  cascais: "Cascais",
  alentejo: "Alentejo",
  algarve: "Algarve",
  coimbra: "Coimbra",
  aveiro: "Aveiro"
};

const PORTUGAL_REGION_ORDER: ReadonlyArray<keyof typeof regionIdsBySlug> = [
  "porto",
  "douro-valley",
  "lisbon",
  "sintra",
  "cascais",
  "alentejo",
  "algarve",
  "coimbra",
  "aveiro"
];

type Props = {
  /** Synthetic region UUIDs (or any string — unknown ids are ignored). */
  value: readonly string[];
  /** Fires with the new full set of synthetic region UUIDs. */
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function RegionPicker({ value, onChange, disabled = false }: Props) {
  const groupId = React.useId();
  const helpId = `${groupId}-help`;
  const selectedSlugs = React.useMemo(
    () => new Set(regionIdsToSlugs(value)),
    [value]
  );

  function toggle(slug: keyof typeof regionIdsBySlug) {
    const next = new Set(selectedSlugs);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onChange(slugsToRegionIds([...next]));
  }

  return (
    <fieldset
      className="grid gap-2"
      data-testid="region-picker"
      disabled={disabled}
    >
      <legend className="text-sm font-medium text-foreground">
        Regions covered
      </legend>
      <p
        id={helpId}
        className="text-xs text-[var(--color-muted-foreground)]"
      >
        Pick the regions where you actively consult or guide. Tier 3
        dispatch matches via the on-call rota; Tier 4 via license
        verification. Leave blank to finish the rest of your profile
        first and add regions later from the dashboard.
      </p>
      <div
        role="group"
        aria-describedby={helpId}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        data-testid="region-picker-grid"
      >
        {PORTUGAL_REGION_ORDER.map((slug) => {
          const inputId = `${groupId}-${slug}`;
          const checked = selectedSlugs.has(slug);
          return (
            <label
              key={slug}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground hover:bg-white has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ochre-light"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(slug)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                data-testid={`region-picker-${slug}`}
              />
              <span>{PORTUGAL_REGION_LABELS[slug]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
