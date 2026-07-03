"use client";

import { useState, type ChangeEvent } from "react";

export interface PromptMultiplierProps {
  label: string;
  slug: string;
  initial: number;
  min?: number;
  max?: number;
  step?: number;
  showScaleLabels?: boolean;
}

export function PromptMultiplier({
  label,
  slug,
  initial,
  min = 0,
  max = 2,
  step = 0.1,
  showScaleLabels = true,
}: PromptMultiplierProps) {
  const [value, setValue] = useState<number>(initial);

  const handleRange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(parseFloat(event.target.value));

  const handleNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(event.target.value);
    if (Number.isFinite(next)) setValue(next);
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-12 md:col-span-4">
        <label
          htmlFor={`multiplier-${slug}`}
          className="font-label-ui text-label-ui text-primary block"
        >
          {label}
        </label>
        <p className="font-mono-technical text-mono-technical text-on-surface-variant mt-1">
          {slug}
        </p>
      </div>
      <div className="col-span-12 md:col-span-6">
        <div className="flex items-center gap-3">
          <input
            id={`multiplier-${slug}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleRange}
            className="prompt-multiplier-range flex-1"
            aria-label={`${label} slider`}
          />
          {showScaleLabels ? (
            <>
              <span className="font-mono-technical text-mono-technical text-on-surface-variant w-8 text-right">
                {min.toFixed(1)}
              </span>
              <span aria-hidden className="font-mono-technical text-on-surface-variant">
                –
              </span>
              <span className="font-mono-technical text-mono-technical text-on-surface-variant w-8">
                {max.toFixed(1)}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <div className="col-span-12 md:col-span-2 flex justify-end">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleNumber}
          aria-label={`${label} value`}
          className="w-24 font-mono-technical text-mono-technical text-primary bg-white border border-outline-variant rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
        />
      </div>
      <style>{`
        .prompt-multiplier-range { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 9999px; background: rgba(79, 99, 88, 0.3); outline: none; }
        .prompt-multiplier-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          height: 16px; width: 16px; border-radius: 50%;
          background: var(--color-ochre-dark);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
          border: 2px solid white;
        }
        .prompt-multiplier-range::-moz-range-thumb {
          height: 16px; width: 16px; border-radius: 50%;
          background: var(--color-ochre-dark);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
          border: 2px solid white;
        }
        .prompt-multiplier-range:focus-visible { outline: 2px solid var(--color-ochre-light); outline-offset: 4px; }
      `}</style>
    </div>
  );
}