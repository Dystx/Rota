"use client";

import * as React from "react";
function cn(...values: Array<string | false | null | undefined>): string { return values.filter(Boolean).join(" "); }

/**
 * WhereStep — Stitch 1.2 first question.
 *
 * "Where are you going?" with two big choice cards: confirm the
 * pre-filled destination OR change it. 1 click to confirm.
 *
 * The destination slug is pre-filled from the URL
 * (`?destination=`) by the parent stepper. This step is
 * essentially a confirmation screen — the user can click
 * "Yes" to accept or click "Change" to open an inline
 * search and pick a different one.
 */
const PRESET_LABELS: Record<string, string> = {
  portugal: "Portugal",
  lisbon: "Lisbon",
  porto: "Porto",
  douro: "the Douro Valley",
  sintra: "Sintra",
  cascais: "Cascais",
  coimbra: "Coimbra",
  algarve: "the Algarve",
  azores: "the Azores"
};

function prettyLabel(slug: string): string {
  const key = slug.toLowerCase();
  return PRESET_LABELS[key] ?? slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WhereStep({
  value,
  onChange
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim().length > 0 && draft.trim() !== value) {
      onChange(draft.trim().toLowerCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <div data-testid="where-step" className="flex flex-col gap-3">
      {editing ? (
        <div className="flex items-center gap-2 rounded-lg border border-olive-light/30 bg-white p-2 focus-within:border-ochre-light focus-within:ring-2 focus-within:ring-ochre-light/40">
          <label htmlFor="where-step-input" className="sr-only">
            Destination
          </label>
          <input
            id="where-step-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              } else if (event.key === "Escape") {
                setEditing(false);
                setDraft(value);
              }
            }}
            data-testid="where-step-input"
            className="flex-1 bg-transparent font-headline-sm text-headline-sm text-primary px-2 py-1 focus:outline-none"
          />
          <button
            type="button"
            onClick={commit}
            data-testid="where-step-confirm"
            className="px-3 py-1.5 rounded-md bg-olive-light text-on-primary font-label-ui text-label-ui hover:bg-olive-dark transition-colors"
          >
            Set
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setDraft(value);
          }}
          data-testid="where-step-change"
          className="flex items-center justify-between gap-2 p-4 rounded-xl border-2 border-olive-light/30 bg-white hover:border-ochre-light/60 hover:bg-ochre-light/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden className="ph text-ochre-dark">
              place
            </span>
            <span className="font-headline-sm text-headline-sm text-primary">
              {prettyLabel(value)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
            Change
            <span aria-hidden className="ph text-[14px]">
              edit
            </span>
          </span>
        </button>
      )}
      <p
        className={cn(
          "font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant text-center"
        )}
      >
        Pre-filled from the bento. Tap Change to switch.
      </p>
    </div>
  );
}
