import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type StatCardTone = "neutral" | "info" | "success" | "warning" | "danger";

export type StatCardTrendDirection = "up" | "down" | "flat";

export type StatCardTrend = {
  direction: StatCardTrendDirection;
  label: ReactNode;
};

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  tone?: StatCardTone;
  trend?: StatCardTrend;
  isLoading?: boolean;
};

const toneAccentClass: Record<StatCardTone, string> = {
  neutral: "text-[var(--color-muted-foreground)]",
  info: "text-[var(--color-status-info-fg)]",
  success: "text-[var(--color-status-success-fg)]",
  warning: "text-[var(--color-status-warning-fg)]",
  danger: "text-[var(--color-status-danger-fg)]",
};

const trendArrow: Record<StatCardTrendDirection, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const trendColor: Record<StatCardTrendDirection, string> = {
  up: "text-[var(--color-status-success-fg)]",
  down: "text-[var(--color-status-danger-fg)]",
  flat: "text-[var(--color-muted-foreground)]",
};

export function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "neutral",
  trend,
  isLoading = false,
  className,
  ...rest
}: StatCardProps) {
  return (
    <div
      data-tone={tone}
      data-loading={isLoading ? "true" : undefined}
      className={cn(
        "grid gap-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-translucent)] p-6 shadow-[var(--shadow-stat-card)] backdrop-blur-2xl",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.18em]",
            toneAccentClass[tone]
          )}
        >
          {label}
        </p>
        {icon ? (
          <span aria-hidden="true" className={cn("text-[var(--color-muted-foreground)]", toneAccentClass[tone])}>
            {icon}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div
          data-testid="statcard-skeleton"
          className="h-8 w-24 animate-pulse rounded-md bg-[var(--color-skeleton)]"
        />
      ) : (
        <p className="font-[family-name:var(--font-rota-display)] text-3xl tracking-tight text-[var(--color-foreground)]">
          {value}
        </p>
      )}

      {helper || trend ? (
        <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--color-muted-foreground)]">
          {helper ? <span>{helper}</span> : <span aria-hidden="true" />}
          {trend ? (
            <span
              data-trend={trend.direction}
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trendColor[trend.direction]
              )}
            >
              <span aria-hidden="true">{trendArrow[trend.direction]}</span>
              <span>{trend.label}</span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type StatCardGridProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function StatCardGrid({ className, children, ...rest }: StatCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
