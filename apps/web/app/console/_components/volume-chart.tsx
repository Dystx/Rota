"use client";

import { useState } from "react";

interface BarDatum {
  label: string;
  height: string;
  fill: string;
  peak?: boolean;
}

const WEEKLY_BARS: BarDatum[] = [
  { label: "Mon", height: "60%", fill: "bg-olive-light/20" },
  { label: "Tue", height: "80%", fill: "bg-olive-light/35" },
  { label: "Wed", height: "40%", fill: "bg-olive-light/15" },
  { label: "Thu", height: "90%", fill: "bg-olive-light/60", peak: true },
  { label: "Fri", height: "70%", fill: "bg-olive-light/45" },
  { label: "Sat", height: "50%", fill: "bg-olive-light/25" },
  { label: "Sun", height: "85%", fill: "bg-olive-light/55" },
];

export interface VolumeChartProps {
  weekly: BarDatum[];
}

export function VolumeChart({ weekly }: VolumeChartProps) {
  const [range, setRange] = useState<"weekly" | "monthly">("weekly");
  const [hovered, setHovered] = useState<number | null>(null);

  const data = range === "weekly" ? weekly : weekly;

  return (
    <section className="glass-card rounded-xl p-card-padding flex flex-col min-h-[400px]">
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
      <div className="flex-1 rounded-lg border border-outline/10 bg-white/30 flex items-end p-4 gap-2 relative min-h-[260px]">
        {data.map((bar, index) => (
          <div
            key={bar.label}
            className="flex-1 flex flex-col items-stretch justify-end gap-2 h-full"
          >
            <div
              className="relative w-full"
              style={{ height: bar.height }}
            >
              <div
                role="img"
                aria-label={`${bar.label} ${bar.height} of weekly volume${
                  bar.peak ? " — peak" : ""
                }`}
                className={`absolute inset-x-0 bottom-0 rounded-t-md ${bar.fill} ${
                  hovered === index ? "opacity-90" : ""
                } transition-opacity`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
              {bar.peak && hovered === index ? (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono-micro text-mono-micro uppercase tracking-widest bg-primary text-on-primary px-2 py-1 rounded">
                  Peak
                </span>
              ) : null}
            </div>
            <span className="font-mono-technical text-mono-technical text-on-surface-variant text-center">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}