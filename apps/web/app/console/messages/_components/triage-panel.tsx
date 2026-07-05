"use client";

import { useState, useTransition, type FormEvent } from "react";
import { SnippetCard } from "../../_components/snippet-card";
import type { Day } from "../_lib/conversations";

/**
 * Pushed itinerary event as surfaced in the right-side timeline.
 * Mirrors the row shape returned by /api/console/itinerary-events.
 */
export interface ItineraryEvent {
  id: string;
  eventType: "activity" | "accommodation" | "transfer" | "dining";
  title: string;
  eventDate: string;
  eventTime: string;
  createdAt: string;
}

/**
 * What the operator types into the form, normalized for the API.
 * The component owns form-state validation; the parent owns the
 * network call.
 */
export interface PushPayload {
  conversationId: string;
  eventType: ItineraryEvent["eventType"];
  title: string;
  eventDate: string;
  eventTime: string;
  internalNotes?: string;
}

export type PushResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

interface TriagePanelProps {
  activeDay: Day;
  recentEvents: ReadonlyArray<ItineraryEvent>;
  recentEventsLoading: boolean;
  /** Called after a successful push so the parent can refetch. */
  onRefreshRecent: (conversationId: string) => void;
  /** Parent-provided API call. The component never hits fetch() directly. */
  onPush: (payload: PushPayload) => Promise<PushResult>;
}

/**
 * Column 3: snippet library (static) + Update Timeline form +
 * recent-pushes list. Form state lives inside the component; the
 * page only sees the push result and the read-only recent-events
 * list.
 */
export function TriagePanel({
  activeDay,
  recentEvents,
  recentEventsLoading,
  onRefreshRecent,
  onPush,
}: TriagePanelProps) {
  const [timelineStatus, setTimelineStatus] = useState<
    "idle" | "submitting" | { kind: "ok"; id: string } | { kind: "error"; message: string }
  >("idle");
  const [isTimelinePending, startTimelineTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: PushPayload = {
      conversationId: activeDay.id,
      eventType: (String(formData.get("eventType") ?? "activity")) as PushPayload["eventType"],
      title: String(formData.get("title") ?? "").trim(),
      eventDate: String(formData.get("eventDate") ?? ""),
      eventTime: String(formData.get("eventTime") ?? ""),
      internalNotes: String(formData.get("internalNotes") ?? "").trim() || undefined,
    };
    if (!payload.title) {
      setTimelineStatus({ kind: "error", message: "Title is required." });
      return;
    }
    if (!payload.eventDate || !payload.eventTime) {
      setTimelineStatus({ kind: "error", message: "Date and time are required." });
      return;
    }
    setTimelineStatus("submitting");
    startTimelineTransition(async () => {
      const result = await onPush(payload);
      if (!result.ok) {
        setTimelineStatus({ kind: "error", message: result.error });
        return;
      }
      setTimelineStatus({ kind: "ok", id: result.id });
      // Refresh the Recent pushes list so the new event appears
      // at the top. Reset non-required fields so the operator
      // can push a second event without first clearing the first.
      onRefreshRecent(activeDay.id);
      form.reset();
    });
  }

  return (
    <aside className="w-[340px] flex-shrink-0 flex flex-col gap-gutter">
      <section className="flex-1 min-h-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
        <header className="px-4 py-3 border-b border-olive-light/10 bg-white/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="material-symbols-outlined text-ochre-dark"
            >
              library_books
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary">
              Snippet Library
            </h3>
          </div>
          <button
            type="button"
            aria-label="Add new snippet"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <span aria-hidden className="material-symbols-outlined">
              add_circle
            </span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-gutter">
          <div>
            <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant mb-2">
              Kyoto Recommendations
            </h4>
            <div className="flex flex-col gap-2">
              <SnippetCard
                title="Camellia Tea Ceremony"
                body="A 90-minute intimate tea ceremony hosted in a 100-year-old machiya in Gion. Includes wagashi tasting and quiet reflection time."
              />
              <SnippetCard
                title="Arashiyama Early Morning"
                body="Pre-dawn departure to avoid crowds. Includes private prayer at the bamboo grove before opening hours."
              />
            </div>
          </div>
          <div>
            <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant mb-2">
              General Admin
            </h4>
            <div className="flex flex-col gap-2">
              <SnippetCard
                title="Deposit Reminder"
                body="Friendly nudge that the second 50% deposit is due 60 days before departure, with a direct payment link."
              />
            </div>
          </div>
        </div>
        <footer className="p-3 bg-surface-container-lowest/50 border-t border-olive-light/10 shrink-0">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant text-center">
            Drag snippets to chat
          </p>
        </footer>
      </section>

      <section className="flex-1 min-h-0 flex flex-col bg-glass-dark text-on-primary backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10">
        <header className="px-4 py-3 border-b border-white/10 bg-black/20 flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="material-symbols-outlined text-ochre-light"
          >
            timeline
          </span>
          <h3 className="font-headline-sm text-headline-sm text-ochre-light">
            Update Timeline
          </h3>
        </header>
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-primary/80">
            Push a new event onto {activeDay.name}&apos;s
            itinerary. The change is logged and visible in the
            workspace.
          </p>
          <form
            className="flex flex-col gap-3"
            data-testid="push-to-timeline-form"
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                Event Type
              </span>
              <select
                name="eventType"
                defaultValue="activity"
                data-testid="push-event-type"
                className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
              >
                <option value="activity" className="text-primary">
                  Activity / Tour
                </option>
                <option value="accommodation" className="text-primary">
                  Accommodation
                </option>
                <option value="transfer" className="text-primary">
                  Transfer
                </option>
                <option value="dining" className="text-primary">
                  Dining
                </option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                Title
              </span>
              <input
                name="title"
                type="text"
                defaultValue="Camellia Tea Ceremony"
                data-testid="push-event-title"
                className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                  Date
                </span>
                <input
                  name="eventDate"
                  type="date"
                  defaultValue="2024-10-14"
                  data-testid="push-event-date"
                  className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                />
              </label>
              <label className="block">
                <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                  Time
                </span>
                <input
                  name="eventTime"
                  type="time"
                  defaultValue="14:00"
                  data-testid="push-event-time"
                  className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                />
              </label>
            </div>
            <label className="block">
              <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                Internal Notes
              </span>
              <textarea
                name="internalNotes"
                rows={2}
                placeholder="For the team only…"
                data-testid="push-event-notes"
                className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light resize-none"
              />
            </label>
            <button
              type="submit"
              disabled={isTimelinePending}
              data-testid="push-event-submit"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-ochre-dark text-white font-label-ui text-label-ui px-4 py-2.5 rounded-lg hover:bg-ochre-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                sync_alt
              </span>
              {isTimelinePending ? "Pushing…" : "Push to Timeline"}
            </button>
            {timelineStatus !== "idle" && timelineStatus !== "submitting" ? (
              <p
                data-testid="push-event-status"
                role={timelineStatus.kind === "error" ? "alert" : "status"}
                className={
                  timelineStatus.kind === "error"
                    ? "font-body-sm text-body-sm text-red-300"
                    : "font-body-sm text-body-sm text-emerald-300"
                }
              >
                {timelineStatus.kind === "error"
                  ? `Error: ${timelineStatus.message}`
                  : `Recorded — id ${timelineStatus.id.slice(0, 8)}`}
              </p>
            ) : null}
          </form>

          <div
            data-testid="recent-pushes"
            className="border-t border-white/10 pt-4 mt-2"
          >
            <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 flex items-center gap-2">
              <span aria-hidden className="material-symbols-outlined text-[14px]">
                history
              </span>
              Recent pushes
            </h4>
            {recentEventsLoading && recentEvents.length === 0 ? (
              <p
                data-testid="recent-pushes-loading"
                className="font-body-sm text-body-sm text-on-primary/60 italic"
              >
                Loading…
              </p>
            ) : null}
            {!recentEventsLoading && recentEvents.length === 0 ? (
              <p
                data-testid="recent-pushes-empty"
                className="font-body-sm text-body-sm text-on-primary/60 italic"
              >
                Nothing pushed yet. The form above is the only way to
                log an event for this conversation.
              </p>
            ) : null}
            <ul
              data-testid="recent-pushes-list"
              className="flex flex-col gap-2"
            >
              {recentEvents.map((event) => (
                <li
                  key={event.id}
                  data-testid="recent-push-item"
                  className="rounded-lg bg-white/5 border border-white/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
                      {event.eventType}
                    </span>
                    <span className="font-mono-technical text-mono-technical text-on-primary/60">
                      {event.eventDate} · {event.eventTime}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-primary">
                    {event.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </aside>
  );
}
