"use client";

import * as React from "react";

export interface BarDatum {
  label: string;
  height: string;
  fill: string;
  peak?: boolean;
}

export interface VolumeChartProps {
  weekly: readonly BarDatum[];
  monthly?: readonly BarDatum[];
}

export function VolumeChart({ weekly, monthly = weekly }: VolumeChartProps) {
  const [range, setRange] = React.useState<"weekly" | "monthly">("weekly");
  const [hovered, setHovered] = React.useState<number | null>(null);

  const data = range === "weekly" ? weekly : monthly;

  return (
    <section className="glass-card rounded-xl p-card-padding flex flex-col">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Volume Trends
        </h3>
        <div className="inline-flex items-center gap-1 bg-surface-container-lowest/50 rounded-full p-1 border border-outline/10">
          <button
            type="button"
            aria-pressed={range === "weekly"}
            onClick={() => setRange("weekly")}
            className={`font-label-ui text-label-ui px-3 py-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${
              range === "weekly"
                ? "bg-olive-dark text-linen-dark"
                : "text-on-surface-variant hover:bg-white/60"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            aria-pressed={range === "monthly"}
            onClick={() => setRange("monthly")}
            className={`font-label-ui text-label-ui px-3 py-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${
              range === "monthly"
                ? "bg-olive-dark text-linen-dark"
                : "text-on-surface-variant hover:bg-white/60"
            }`}
          >
            Monthly
          </button>
        </div>
      </header>
      {/* Chart layout: a flex row of bars aligned to the bottom.
          Each bar is a flex column with the bar fill (explicit height
          from the data) and the day label below it. The previous
          version used `h-full` + percentage heights on the bar
          fills, but percentage heights inside a flex child don't
          resolve when the parent has no explicit height — the bars
          collapsed to zero. Using `flex-1` on the bar wrapper
          (so the wrapper takes the full column height) and an
          explicit pixel height on the fill (computed from the data
          ratio × the known chart height) is reliable. */}
      <div className="rounded-lg border border-outline/10 bg-white/30 p-4">
        <div className="flex items-end gap-2 h-[240px]">
          {data.map((bar, index) => {
            const ratio = parseInt(bar.height, 10) / 100;
            const fillHeight = Math.round(240 * ratio);
            return (
              <div
                key={bar.label}
                className="flex-1 flex flex-col items-center justify-end h-full relative"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  role="img"
                  aria-label={`${bar.label} ${bar.height} of weekly volume${
                    bar.peak ? " — peak" : ""
                  }`}
                  className={`w-full rounded-t-md ${bar.fill} ${
                    hovered === index ? "opacity-90" : ""
                  } transition-opacity`}
                  style={{ height: `${fillHeight}px` }}
                />
                {bar.peak && hovered === index ? (
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono-micro text-mono-micro uppercase tracking-widest bg-primary text-on-primary px-2 py-1 rounded whitespace-nowrap">
                    Peak
                  </span>
                ) : null}
                <span className="font-mono-technical text-mono-technical text-on-surface-variant text-center mt-2 absolute -bottom-6 left-0 right-0">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Spacer to account for the absolutely-positioned labels
            below the bar row. */}
        <div className="h-6" />
      </div>
    </section>
  );
}
