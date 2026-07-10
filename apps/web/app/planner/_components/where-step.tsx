"use client";

import * as React from "react";
import { ChoiceCard } from "@repo/ui";

type DestinationOption = {
  value: string;
  label: string;
  description: string;
};

/** The destinations exposed by the Portugal-first planner. */
export const DESTINATION_OPTIONS: ReadonlyArray<DestinationOption> = [
  { value: "portugal", label: "Portugal", description: "A first taste, from coast to countryside." },
  { value: "lisbon", label: "Lisbon", description: "Tile-lined streets, miradouros, and Tagus light." },
  { value: "porto", label: "Porto", description: "Ribeira walks, Atlantic air, and the Douro nearby." },
  { value: "douro", label: "the Douro Valley", description: "Terraced vineyards, river bends, and long lunches." },
  { value: "sintra", label: "Sintra", description: "Forest paths, palaces, and a cooler mountain air." },
  { value: "cascais", label: "Cascais", description: "Sea-cliff walks, easy swims, and village evenings." },
  { value: "coimbra", label: "Coimbra", description: "A river city with old-world rhythm and quiet corners." },
  { value: "algarve", label: "the Algarve", description: "Warm coves, slow lunches, and wide-open horizons." },
  { value: "azores", label: "the Azores", description: "Volcanic lakes, green trails, and Atlantic weather." }
];

function normalizeDestination(value: string): string {
  return value.trim().toLowerCase().replace(/^the\s+/, "");
}

function destinationLabel(value: string): string {
  const normalized = normalizeDestination(value);
  return DESTINATION_OPTIONS.find((option) => option.value === normalized)?.label ?? value;
}

/**
 * WhereStep is deliberately choice-only. A pre-filled destination can be
 * confirmed immediately; Change reveals the finite Portugal destination set.
 */
export function WhereStep({
  value,
  onChange
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const selectedValue = normalizeDestination(value);

  return (
    <div data-testid="where-step" className="flex flex-col gap-3">
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          data-testid="where-step-change"
          aria-expanded={false}
          className="flex items-center justify-between gap-2 rounded-xl border-2 border-olive-light/30 bg-white p-4 transition-colors hover:border-ochre-light/60 hover:bg-ochre-light/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden className="ph text-ochre-dark">place</span>
            <span className="font-headline-sm text-headline-sm text-primary">
              {destinationLabel(value)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
            Change
            <span aria-hidden className="ph text-[14px]">edit</span>
          </span>
        </button>
      ) : (
        <div className="grid gap-3" data-testid="where-step-options">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
              Choose a destination
            </p>
            <button
              type="button"
              onClick={() => setEditing(false)}
              data-testid="where-step-cancel"
              className="rounded-md px-2 py-1 text-sm text-on-surface-variant underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            >
              Keep {destinationLabel(value)}
            </button>
          </div>
          <div role="radiogroup" aria-label="Destination choices" className="grid gap-3 sm:grid-cols-2">
            {DESTINATION_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                id={`where-destination-${option.value}`}
                name="where-destination"
                value={option.value}
                label={option.label}
                description={option.description}
                selected={selectedValue === option.value}
                onSelect={(next) => {
                  onChange(next);
                  setEditing(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
      <p className="text-center font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
        {editing ? "Select one place to shape the route." : "Pre-filled from your discovery choices. Tap Change to switch."}
      </p>
    </div>
  );
}
