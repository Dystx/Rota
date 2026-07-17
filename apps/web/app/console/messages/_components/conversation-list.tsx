"use client";

import * as React from "react";
import type { Day } from "../_lib/conversations";
import { DecisionStatePanel, Icon } from "@repo/ui";

interface DayListProps {
  days: ReadonlyArray<Day>;
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
 * finite choice filter, and a scrollable list of day
 * cards. Each card mirrors the reference's day/date pattern:
 * date pill on the left,
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
    <aside className="w-full min-h-[20rem] shrink-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden lg:min-h-0 lg:w-[clamp(16rem,24vw,20rem)]">
      <header className="p-4 border-b border-olive-light/10 flex items-center justify-between shrink-0">
        <h2 className="font-headline-sm text-headline-sm text-primary">Itinerary Days</h2>
        <button
          type="button"
          aria-label="Filter days"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <Icon name="funnel" />
        </button>
      </header>
      <div className="p-3 border-b border-olive-light/10 bg-surface-container-lowest/50">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant mb-2">
          Focus a day
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter itinerary days">
          <button
            type="button"
            aria-pressed={search === ""}
            onClick={() => onSearchChange("")}
            data-testid="conversations-filter-all"
            className={`rounded-full px-3 py-1.5 font-label-ui text-label-ui border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light ${search === "" ? "bg-primary text-on-primary border-primary" : "bg-white/50 text-primary border-outline-variant/40 hover:bg-white"}`}
          >
            All days
          </button>
          {days.map((day) => {
            const selected = search === day.title;
            return (
              <button
                key={day.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSearchChange(day.title)}
                data-testid={`conversations-filter-${day.id}`}
                className={`rounded-full px-3 py-1.5 font-label-ui text-label-ui border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light ${selected ? "bg-primary text-on-primary border-primary" : "bg-white/50 text-primary border-outline-variant/40 hover:bg-white"}`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
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
        {days.length === 0 ? (
          <li>
            <DecisionStatePanel
              kind="unavailable"
              headingLevel={3}
              title="No conversations available"
              description="Persisted conversations will appear here when connected."
              className="min-h-0 rounded-none border-0 px-4 py-10"
            />
          </li>
        ) : null}
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
                      className="shrink-0 inline-flex flex-col items-center justify-center w-14 h-14 rounded-lg text-on-primary font-mono-technical text-[11px] uppercase tracking-wider leading-tight shadow-sm"
                      style={{ backgroundColor: day.accent }}
                    >
                      <span className="text-[9px] opacity-80">{day.label.split(" ")[0]}</span>
                      <span className="text-[12px] font-bold">{day.date}</span>
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
