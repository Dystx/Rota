import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface MapStopMarker {
  id: string;
  label: string;
  x: number;
  y: number;
  isActive?: boolean;
}

export interface MapDayLayer {
  id: string;
  title: string;
  stops: MapStopMarker[];
}

export interface MapRouteWarning {
  id: string;
  message: string;
  severity?: "high" | "medium" | "low";
}

export interface RouteMapProps extends HTMLAttributes<HTMLDivElement> {
  selectedDayId?: string;
  days?: MapDayLayer[];
  warnings?: MapRouteWarning[];
  children?: ReactNode;
}

export function RouteMap({
  selectedDayId,
  days = [],
  warnings = [],
  className,
  children,
  ...props
}: RouteMapProps) {
  const selectedDay = days.find((d) => d.id === selectedDayId) || days[0];

  return (
    <div
      className={cn(
        "relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(177,232,251,0.25),rgba(247,250,249,0.96))] shadow-[0_24px_60px_rgba(7,17,19,0.06)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(48,101,118,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(187,201,201,0.3),transparent_30%),linear-gradient(135deg,rgba(247,250,249,0.5),rgba(235,238,237,0.5))]" />

      {selectedDay && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {selectedDay.stops.map((stop, i) => {
              if (i === 0) return null;
              const prev = selectedDay.stops[i - 1];
              if (!prev) return null;
              return (
                <line
                  key={`${prev.id}-${stop.id}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${stop.x}%`}
                  y2={`${stop.y}%`}
                  stroke="rgba(48,101,118,0.35)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
              );
            })}
          </svg>

          {selectedDay.stops.map((stop) => (
            <div
              key={stop.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-[2.5px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform duration-300",
                  stop.isActive
                    ? "h-9 w-9 scale-110 bg-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/20"
                    : "h-7 w-7 scale-100 bg-[var(--color-foreground)]"
                )}
              >
                <span className="text-[11px] font-bold text-white">{stop.label.charAt(0)}</span>
              </div>
              <div
                className={cn(
                  "absolute top-full mt-2 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-foreground)] shadow-sm backdrop-blur-md whitespace-nowrap transition-opacity",
                  stop.isActive ? "opacity-100" : "opacity-80"
                )}
              >
                {stop.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="absolute top-6 left-1/2 flex -translate-x-1/2 flex-col gap-2 z-20">
          {warnings.map((w) => (
            <div
              key={w.id}
              className={cn(
                "flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-medium shadow-md backdrop-blur-md transition-all",
                w.severity === "high"
                  ? "border-[#f5c2c7]/60 bg-[#f8d7da]/90 text-[#842029]"
                  : w.severity === "medium"
                    ? "border-[#ffd97a]/60 bg-[#fff3cd]/90 text-[#664d03]"
                    : "border-[var(--color-border)] bg-white/90 text-[var(--color-foreground)]"
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {w.message}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 h-full w-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export interface MapPanelProps extends HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right";
}

export function MapPanel({ position = "left", className, children, ...props }: MapPanelProps) {
  return (
    <div
      className={cn(
        "absolute bottom-6 top-6 flex w-[320px] flex-col gap-5 overflow-y-auto rounded-[24px] border border-[var(--color-border)] bg-white/85 p-5 shadow-[0_16px_40px_rgba(7,17,19,0.08)] backdrop-blur-xl pointer-events-auto",
        position === "left" ? "left-6" : "right-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TravelTimeChip({
  time,
  distance,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { time: string; distance?: string }) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md",
        className
      )}
      {...props}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="tracking-wide">{time}</span>
      {distance && (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--color-border)]" />
          <span className="tracking-wide">{distance}</span>
        </>
      )}
    </div>
  );
}
