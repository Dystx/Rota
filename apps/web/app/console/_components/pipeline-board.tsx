"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { KanbanCard } from "./kanban-card";
import { KanbanLane } from "./kanban-lane";

/**
 * A single trip-shaped row surfaced on the Operations Pipeline board.
 * Mirrors the `trips` table columns we care about for the kanban view.
 * The shape is intentionally narrow — the full `TripDraft` lives in
 * `@repo/db` and is not needed for the lane-level summary.
 */
export interface PipelineItem {
  id: string;
  title: string;
  body: string;
  clientName: string;
  status: "draft" | "in_revision" | "active_chat";
  slaHours: number | null;
  updatedAt: string | null;
}

interface PipelineBoardProps {
  /** Server-rendered fallback when Supabase is unreachable or USE_REALTIME is off. */
  initialItems?: PipelineItem[];
}

const FALLBACK_ITEMS: PipelineItem[] = [
  {
    id: "fallback-tokyo",
    title: "Tokyo Culinary Tour",
    body: "Client requested focus on omakase experiences and hidden izakayas in Shinjuku.",
    clientName: "E. Sato",
    status: "draft",
    slaHours: 2,
    updatedAt: null
  },
  {
    id: "fallback-alpine",
    title: "Alpine Ski Retreat",
    body: "Family of 4, needs gear rental integration and ski school bookings.",
    clientName: "J. Doe",
    status: "draft",
    slaHours: 12,
    updatedAt: null
  },
  {
    id: "fallback-amalfi",
    title: "Amalfi Coast Honeymoon",
    body: "Reviewing proposed yacht charter schedule and dinner reservations.",
    clientName: "M. Rossi",
    status: "in_revision",
    slaHours: null,
    updatedAt: new Date(Date.now() - 10 * 60_000).toISOString()
  },
  {
    id: "fallback-iceland",
    title: "Iceland Ring Road",
    body: "Can we add an extra day near Vik? The forecast looks great.",
    clientName: "L. Chen",
    status: "active_chat",
    slaHours: null,
    updatedAt: null
  }
];

const STATUS_LABELS: Record<PipelineItem["status"], { title: string; dot: "secondary" | "ochre" | "surface-tint" }> = {
  draft: { title: "New Drafts", dot: "secondary" },
  in_revision: { title: "In Revision", dot: "ochre" },
  active_chat: { title: "Active Chats", dot: "surface-tint" }
};

const STATUS_ORDER: PipelineItem["status"][] = ["draft", "in_revision", "active_chat"];

function statusToBadge(slaHours: number | null, updatedAt: string | null, status: PipelineItem["status"]) {
  if (slaHours !== null && status === "draft") {
    return {
      label: `SLA: ${slaHours}h`,
      tone: slaHours <= 4 ? ("error" as const) : ("ochre" as const)
    };
  }
  if (updatedAt && status === "in_revision") {
    const minutes = Math.max(1, Math.round((Date.now() - Date.parse(updatedAt)) / 60_000));
    return { label: `Updated ${minutes}m ago`, tone: "ochre-dark" as const };
  }
  return undefined;
}

export function PipelineBoard({ initialItems = FALLBACK_ITEMS }: PipelineBoardProps) {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  // Track presence of the realtime subscription so the UI can show
  // a small "live" indicator when the channel is connected.
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Feature flag: only opt into Realtime when explicitly enabled.
    // Default off so SSR / local dev / no-Supabase environments
    // continue to render the hardcoded board.
    if (process.env.NEXT_PUBLIC_USE_REALTIME_PIPELINE !== "true") return;

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("console-pipeline")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Record<string, unknown> | null;
          if (!row || typeof row.id !== "string") return;
          const next: PipelineItem = {
            id: row.id,
            title: typeof row.title === "string" ? row.title : "Untitled trip",
            body: typeof row.brief === "object" && row.brief && "summary" in row.brief
              ? String((row.brief as Record<string, unknown>).summary ?? "")
              : "",
            clientName: typeof row.owner_user_id === "string" ? row.owner_user_id.slice(0, 8) : "—",
            status: mapTripStatus(row.status),
            slaHours: typeof row.sla_hours === "number" ? row.sla_hours : null,
            updatedAt: typeof row.updated_at === "string" ? row.updated_at : null
          };
          setItems((prev) => {
            const without = prev.filter((item) => item.id !== next.id);
            // payload.eventType is the canonical field on RealtimePostgresChangesPayload
            // (event is also exposed on the v2 client; the cast is a
            // type-narrowing shortcut since the union already includes
            // both spellings across SDK versions).
            const isDelete =
              (payload as { eventType?: string; event?: string }).eventType === "DELETE" ||
              (payload as { eventType?: string; event?: string }).event === "DELETE";
            if (isDelete) return without;
            return [...without, next];
          });
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const lanes = STATUS_ORDER.map((status) => ({
    status,
    ...STATUS_LABELS[status],
    items: items.filter((item) => item.status === status)
  }));

  return (
    <div
      className="flex-1 flex gap-gutter overflow-x-auto pb-4 rounded-xl"
      data-realtime={isLive ? "live" : "fallback"}
      data-testid="pipeline-board"
    >
      {lanes.map((lane) => (
        <KanbanLane
          key={lane.status}
          title={lane.title}
          count={lane.items.length}
          dot={lane.dot}
        >
          {lane.items.length === 0 ? (
            <p className="text-xs text-on-surface-variant/60 italic px-3 py-4">No items in this lane.</p>
          ) : (
            lane.items.map((item) => (
              <KanbanCard
                key={item.id}
                title={item.title}
                body={item.body}
                clientName={item.clientName}
                badge={statusToBadge(item.slaHours, item.updatedAt, item.status)}
                avatar={{ initials: initialsFor(item.clientName), alt: `${item.clientName} initials` }}
              />
            ))
          )}
        </KanbanLane>
      ))}
    </div>
  );
}

function mapTripStatus(raw: unknown): PipelineItem["status"] {
  if (typeof raw !== "string") return "draft";
  if (raw === "in_review" || raw === "in_revision" || raw === "needs_revision") return "in_revision";
  if (raw === "active" || raw === "in_progress" || raw === "on_trip") return "active_chat";
  return "draft";
}

function initialsFor(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1];
  return (first[0] + (second?.[0] ?? "")).toUpperCase();
}
