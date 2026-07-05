"use client";

import type { ChangeEvent } from "react";
import type { Day } from "../_lib/conversations";

interface DayListProps {
  days: Day[];
  activeId: string;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  /** Number of unread messages since the user last opened a
   *  day thread. Drives the small "N new" badge above the
   *  list. The parent is responsible for clearing this when
   *  the user opens a day. */
  incomingCount: number;
}

/**
 * DayList — the leftmost column of the /console/messages
 * 3-column kanban. Renders the "Itinerary Days" header, a
 * client-side search filter, and a scrollable list of day
 * cards. Each card mirrors the reference's "Day 2 • Oct 13
 * — Higashiyama Exploration" pattern: date pill on the left,
 * title + one-line summary on the right.
 *
 * Extracted from the page so the parent can stay focused on
 * orchestration (state, realtime, triage) and the list can
 * be tested / styled / lazy-loaded independently.
 */
export function ConversationList({
  days,
  activeId,
  onSelect,
  search,
  onSearchChange,
  incomingCount
}: DayListProps) {
  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
      <header className="p-4 border-b border-olive-light/10 flex items-center justify-between shrink-0">
        <h2 className="font-headline-sm text-headline-sm text-primary">Itinerary Days</h2>
        <button
          type="button"
          aria-label="Filter days"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span aria-hidden className="material-symbols-outlined">filter_list</span>
        </button>
      </header>
      <div className="p-3 border-b border-olive-light/10 bg-surface-container-lowest/50">
        <label className="relative block">
          <span className="sr-only">Search days</span>
          <span
            aria-hidden
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          >
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search by day, title, or summary…"
            data-testid="conversations-search"
            className="w-full font-body-md text-body-md pl-10 pr-4 py-2 rounded-lg bg-white/60 border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
          />
        </label>
        {incomingCount > 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-xs text-ochre-dark font-medium"
          >
            {incomingCount} new since you last looked
          </p>
        ) : null}
      </div>
      <ul className="flex-1 overflow-y-auto">
        {days
          .filter((day) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
              day.title.toLowerCase().includes(q) ||
              day.summary.toLowerCase().includes(q) ||
              day.label.toLowerCase().includes(q)
            );
          })
          .map((day) => {
            const isSelected = day.id === activeId;
            return (
              <li key={day.id}>
                <button
                  type="button"
                  onClick={() => onSelect(day.id)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-4 border-b border-olive-light/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1 ${
                    isSelected
                      ? "bg-surface-container border-l-4 border-ochre-light"
                      : "hover:bg-white/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="shrink-0 inline-flex flex-col items-center justify-center w-12 h-12 rounded-md text-on-primary font-mono-technical text-[10px] uppercase tracking-wider leading-tight"
                      style={{ backgroundColor: day.accent }}
                    >
                      <span className="text-[8px] opacity-80">{day.label.split(" ")[0]}</span>
                      <span className="text-[10px] font-semibold">{day.date}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-headline-sm text-headline-sm text-primary truncate">
                        {day.title}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant truncate mt-1">
                        {day.summary}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
