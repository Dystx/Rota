import * as React from "react";
import { Icon } from "@repo/ui";

export interface KpiCardProps {
  eyebrow: string;
  icon: string;
  iconTone?: "ochre-dark" | "olive-light";
  value: string;
  trend: { direction: "up" | "down"; label: string; tone: "olive-light" | "on-error-container" };
}

export function KpiCard({ eyebrow, icon, iconTone = "ochre-dark", value, trend }: KpiCardProps) {
  const trendIcon = trend.direction === "up" ? "trending_up" : "trending_down";
  const trendColor =
    trend.tone === "olive-light" ? "text-olive-light" : "text-on-error-container";

  return (
    <article className="glass-card rounded-xl p-card-padding flex flex-col justify-between h-48">
      <header className="flex items-start justify-between">
        <span className="font-mono-micro text-mono-micro uppercase tracking-widest bg-olive-light/10 text-primary px-2 py-1 rounded">
          {eyebrow}
        </span>
        <Icon
          aria-hidden
          name={icon}
          className={`${
            iconTone === "ochre-dark" ? "text-ochre-dark" : "text-olive-light"
          }`}
        />
      </header>
      <h2 className="font-headline-lg text-headline-lg text-primary">
        {value}
      </h2>
      <p
        className={`font-label-ui text-label-ui flex items-center gap-1 ${trendColor}`}
      >
        <Icon name={trendIcon} className="text-[18px]" />
        {trend.label}
      </p>
    </article>
  );
}
