import type { ReactNode } from "react";

export interface TimelineItemProps {
  time: string;
  status: { label: string; tone: "olive" | "ochre" | "neutral" };
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  variant?: "standard" | "ochre" | "muted";
  rightAction?: ReactNode;
  overrideBanner?: string;
}

const statusClass: Record<"olive" | "ochre" | "neutral", string> = {
  olive: "text-olive-light bg-olive-light/10",
  ochre: "text-ochre-dark bg-ochre-light/20",
  neutral: "text-on-surface-variant bg-surface-container-high",
};

const nodeRingClass: Record<"standard" | "ochre" | "muted", string> = {
  standard: "border-olive-light bg-surface",
  ochre: "border-ochre-light bg-ochre-light/10",
  muted: "border-olive-light bg-surface",
};

export function TimelineItem({
  time,
  status,
  title,
  meta,
  children,
  variant = "standard",
  rightAction,
  overrideBanner,
}: TimelineItemProps) {
  const wrapperClass =
    variant === "muted"
      ? "opacity-70 hover:opacity-100 transition-opacity"
      : "";
  const cardClass =
    variant === "ochre"
      ? "bg-surface rounded-xl p-card-padding premium-shadow border-2 border-ochre-light/50 relative overflow-hidden"
      : "glass-panel-light border border-olive-dark/5 rounded-xl p-card-padding shadow-sm";
  const lineClass =
    variant === "ochre"
      ? "border-dashed border-ochre-light/50"
      : "border-olive-light/20";

  return (
    <div className={`relative pl-8 ${wrapperClass}`}>
      <span
        aria-hidden
        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${nodeRingClass[variant]} flex items-center justify-center z-10`}
      >
        <span
          className={
            variant === "ochre"
              ? "w-0 h-0"
              : "w-2 h-2 rounded-full bg-olive-light"
          }
        />
        {variant === "ochre" ? (
          <span className="material-symbols-outlined text-ochre-light text-[14px]">
            priority_high
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={`absolute left-[11px] top-8 bottom-0 -translate-x-1/2 border-l-2 ${lineClass}`}
      />
      <div className={cardClass}>
        {overrideBanner ? (
          <div className="absolute top-0 left-0 right-0 bg-ochre-light/10 border-b border-ochre-light/20 py-1.5 px-card-padding flex items-center gap-2">
            <span className="material-symbols-outlined text-ochre-dark text-[16px]">
              warning
            </span>
            <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
              {overrideBanner}
            </span>
          </div>
        ) : null}
        <div
          className={`flex items-start justify-between gap-3 mb-2 ${
            overrideBanner ? "mt-7" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono-technical text-mono-technical text-on-surface-variant">
              {time}
            </span>
            <span
              className={`font-mono-micro text-mono-micro uppercase tracking-wider px-2 py-0.5 rounded ${statusClass[status.tone]}`}
            >
              {status.label}
            </span>
          </div>
          {rightAction}
        </div>
        <h4 className="font-headline-sm text-headline-sm text-primary mb-1">
          {title}
        </h4>
        <div className="font-body-md text-body-md text-on-surface-variant">
          {children}
        </div>
        {meta ? (
          <div className="mt-3 pt-3 border-t border-olive-light/10 flex flex-wrap items-center gap-3 text-label-ui font-label-ui text-on-surface-variant">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}