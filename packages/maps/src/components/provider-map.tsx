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
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="font-semibold text-gray-500 mb-2">Mapbox Provider Mode</p>
          <p className="text-sm text-gray-400">Mapbox GL would be initialized here.</p>
          {token && (
            <p className="text-xs text-gray-400 mt-2 font-mono break-all px-4 max-w-sm mx-auto">
              Public Token: {token.slice(0, 8)}...{token.slice(-4)}
            </p>
          )}
        </div>
      </div>
      
      {/* Route Warnings overlay (mirrors schematic map style) */}
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
