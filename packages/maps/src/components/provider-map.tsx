import * as React from "react";
import { getMapProviderToken } from "../provider";

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

export interface ProviderMapProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDayId?: string;
  days?: MapDayLayer[];
  warnings?: MapRouteWarning[];
  children?: React.ReactNode;
}

export function ProviderMap({
  selectedDayId,
  days = [],
  warnings = [],
  className,
  children,
  ...props
}: ProviderMapProps) {
  const token = getMapProviderToken();
  const selectedDay = days.find((d) => d.id === selectedDayId) || days[0];

  return (
    <div
      data-testid="provider-map"
      className={`relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)] ${className || ""}`}
      {...props}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(48,101,118,0.05),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(187,201,201,0.1),transparent_30%),linear-gradient(135deg,rgba(247,250,249,0.8),rgba(235,238,237,0.8))]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
        <div className="text-center">
          <p className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)] mb-1">Mapbox Provider Mode</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">Mapbox GL instance would mount here</p>
        </div>
      </div>

      {selectedDay && (
        <div className="absolute inset-0 pointer-events-none z-10">
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
                  stroke="rgba(48,101,118,0.5)"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {selectedDay.stops.map((stop) => (
            <div
              key={stop.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-500"
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            >
              <div
                className={`flex items-center justify-center rounded-full border-[2px] border-white shadow-sm transition-transform duration-300 ${
                  stop.isActive
                    ? "h-8 w-8 scale-110 bg-[var(--color-foreground)] ring-4 ring-[var(--color-foreground)]/10"
                    : "h-6 w-6 scale-100 bg-[var(--color-muted-foreground)]"
                }`}
              >
                <span className="text-[10px] font-bold text-white">{stop.label.charAt(0)}</span>
              </div>
              <div
                className={`absolute top-full mt-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-[var(--color-foreground)] shadow-sm backdrop-blur-md whitespace-nowrap transition-opacity ${
                  stop.isActive ? "opacity-100" : "opacity-0"
                }`}
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
              className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-medium shadow-md backdrop-blur-md transition-all ${
                w.severity === "high"
                  ? "border-[#f5c2c7]/60 bg-[#f8d7da]/90 text-[#842029]"
                  : w.severity === "medium"
                    ? "border-[#ffd97a]/60 bg-[#fff3cd]/90 text-[#664d03]"
                    : "border-[var(--color-border)] bg-white/90 text-[var(--color-foreground)]"
              }`}
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

      {/* Render children (like MapPanel) */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}
