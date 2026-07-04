"use client";

import * as React from "react";
function cn(...values: Array<string | false | null | undefined>): string { return values.filter(Boolean).join(" "); }

/**
 * WhenStep — Stitch 1.2 second question.
 *
 * "How many days?" with 4 chips: 3 / 5 / 7 / 14. Optional month
 * input (1 type, Enter) for travel window. 1 click to set days.
 */
const DAY_CHIPS = [3, 5, 7, 14] as const;

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
        <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
          Days
        </span>
        <div
          role="radiogroup"
          aria-label="How many days?"
          className="flex flex-wrap items-center justify-center gap-2"
        >
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
                  "px-4 py-2 rounded-full font-label-ui text-label-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
                  isSelected
                    ? "bg-ochre-light text-ochre-dark shadow-md"
                    : "bg-white border border-outline-variant/30 text-primary hover:border-ochre-light/60"
                )}
              >
                {value} days
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <label
          htmlFor="when-month-input"
          className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant"
        >
          Travel window (optional)
        </label>
        <input
          id="when-month-input"
          type="text"
          value={month}
          onChange={(event) => onChangeMonth(event.target.value)}
          placeholder="e.g. May, Sep, or 'next spring'"
          data-testid="when-month-input"
          className="w-full max-w-xs text-center font-body-md text-body-md bg-white border border-outline-variant/30 rounded-md px-3 py-2 text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
        />
      </div>
    </div>
  );
}
