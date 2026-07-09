"use client";

/**
 * PipelineHeader — client island for the /console/pipeline page.
 *
 * Owns the search query + status filter state and pushes both
 * down to <PipelineBoard /> via props. The board filters its
 * items in-memory; the header doesn't re-fetch. When the
 * operator hits the Clear button the search/filter reset and
 * all three lanes re-surface.
 *
 * The status filter is a small popover rather than a routed
 * <select> so the operator can keep their eyes on the board
 * while they triage. The popover is dismissable on outside
 * click + Escape.
 */

import * as React from "react";
import type { PipelineItem } from "../../_components/pipeline-board";

type StatusFilter = "all" | PipelineItem["status"];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "New Drafts" },
  { value: "in_revision", label: "In Revision" },
  { value: "active_chat", label: "Active Chats" }
];

export function PipelineHeader({
  query,
  setQuery,
  statusFilter,
  setStatusFilter
}: {
  query: string;
  setQuery: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const filterButtonRef = React.useRef<HTMLButtonElement | null>(null);

  // Close on outside click + Escape.
  React.useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (filterButtonRef.current?.contains(target)) return;
      setFilterOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const filterLabel =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ?? "Filter";

  return (
    <div className="flex items-center gap-3">
      <label className="relative">
        <span className="sr-only">Search pipeline</span>
        <span
          aria-hidden
          className="ph absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none ph-magnifying-glass"
        >magnifying-glass</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search threads…"
          data-testid="pipeline-search-input"
          className="font-body-md text-body-md pl-10 pr-4 py-2 rounded-full bg-white/60 border border-white/40 backdrop-blur-md text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
        />
      </label>
      <div className="relative">
        <button
          ref={filterButtonRef}
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={filterOpen}
          aria-label="Filter pipeline by status"
          data-testid="pipeline-filter-button"
          className="font-label-ui text-label-ui flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/40 backdrop-blur-md text-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="ph ph-sliders-horizontal">sliders-horizontal</span>
          {filterLabel}
        </button>
        {filterOpen ? (
          <div
            ref={popoverRef}
            role="listbox"
            aria-label="Filter by status"
            data-testid="pipeline-filter-popover"
            className="absolute right-0 top-full mt-2 z-20 min-w-[200px] rounded-xl bg-white shadow-xl border border-olive-light/30 p-2 grid gap-1"
          >
            {STATUS_OPTIONS.map((opt) => {
              const selected = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-testid={`pipeline-filter-${opt.value}`}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setFilterOpen(false);
                  }}
                  className={
                    "text-left px-3 py-2 rounded-lg font-label-ui text-label-ui flex items-center justify-between " +
                    (selected
                      ? "bg-olive-light/15 text-olive-dark"
                      : "text-primary hover:bg-olive-light/10")
                  }
                >
                  {opt.label}
                  {selected ? (
                    <span aria-hidden className="ph text-[16px] ph-check">check</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {(query !== "" || statusFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setStatusFilter("all");
          }}
          data-testid="pipeline-filter-clear"
          className="font-label-ui text-label-ui flex items-center gap-1 px-3 py-2 rounded-full text-ochre-dark hover:bg-ochre-light/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span className="ph text-[16px] ph-x">x</span>
          Clear
        </button>
      )}
    </div>
  );
}
