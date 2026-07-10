"use client";

import * as React from "react";
import { ChoiceChipGroup } from "@repo/ui";

const DAY_CHIPS = [3, 5, 7, 14] as const;

const WINDOW_OPTIONS = [
  { value: "any_time", label: "Any time" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" }
] as const;

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function selectedWindow(month: string): string {
  const normalized = month.trim().toLowerCase();
  return WINDOW_OPTIONS.some((option) => option.value === normalized) ? normalized : "any_time";
}

/** Travel timing is finite-choice only; no month text field is rendered. */
export function WhenStep({
  days,
  month,
  onChangeDays,
  onChangeMonth
}: {
  days: number;
  month: string;
  onChangeDays: (next: number) => void;
  onChangeMonth: (next: string) => void;
}) {
  return (
    <div data-testid="when-step" className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">Days</span>
        <div role="radiogroup" aria-label="How many days?" className="flex flex-wrap items-center justify-center gap-2">
          {DAY_CHIPS.map((value) => {
            const isSelected = value === days;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeDays(value)}
                data-testid={`when-days-${value}`}
                className={cn(
                  "rounded-full px-4 py-2 font-label-ui text-label-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
                  isSelected ? "bg-ochre-light text-primary shadow-md" : "border border-outline-variant/30 bg-white text-primary hover:border-ochre-light/60"
                )}
              >
                {value} days
              </button>
            );
          })}
        </div>
      </div>

      <ChoiceChipGroup
        label="Travel window"
        multiple={false}
        selected={[selectedWindow(month)]}
        options={WINDOW_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        onChange={(values) => {
          const next = values[0];
          if (next) onChangeMonth(next === "any_time" ? "" : next);
        }}
      />
    </div>
  );
}
