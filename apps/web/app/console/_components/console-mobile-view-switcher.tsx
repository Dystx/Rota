"use client";

import * as React from "react";

export type ConsoleMobileView = {
  value: string;
  label: string;
};

export interface ConsoleMobileViewSwitcherProps {
  value: string;
  onChange: (value: string) => void;
  views: readonly ConsoleMobileView[];
  label?: string;
}

/**
 * Explicit mobile navigation for dense operator panes. Desktop keeps the
 * panes side by side; mobile must give each pane a reachable, named view.
 */
export function ConsoleMobileViewSwitcher({
  value,
  onChange,
  views,
  label = "Workspace view"
}: ConsoleMobileViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-3 gap-2 lg:hidden"
    >
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          role="tab"
          aria-selected={value === view.value}
          className="min-h-11 rounded-md border border-outline-variant/60 bg-white/60 px-3 font-label-ui text-label-ui text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          onClick={() => onChange(view.value)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
