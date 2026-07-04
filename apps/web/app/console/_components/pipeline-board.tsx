"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { KanbanCard } from "./kanban-card";
import { KanbanLane } from "./kanban-lane";
import { RelativeTime } from "./relative-time";

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
// LOW-9: keys here are the exhaustive source of truth at the type
// level. The `Record<PipelineItem["status"], ...>` shape means a
// missing key is a compile error. The runtime side is enforced by
// `mapTripStatus` (line 198) returning one of these three strings.
// Adding a new status: add a key here AND a case in mapTripStatus.

const STATUS_ORDER: PipelineItem["status"][] = ["draft", "in_revision", "active_chat"];

function statusToBadge(slaHours: number | null, updatedAt: string | null, status: PipelineItem["status"]) {
  if (slaHours !== null && status === "draft") {
    return {
      label: `SLA: ${slaHours}h`,
      tone: slaHours <= 4 ? ("error" as const) : ("ochre" as const)
    };
  }
  if (updatedAt && status === "in_revision") {
    // PR-14b: live "Updated Xm ago" badge. The label is a JSX node so
    // the parent component (KanbanCard) renders a <time> that ticks
    // every minute on the client. SSR and first client render use the
    // same value (RelativeTime's useState initializer), so there's no
    // hydration mismatch on slow loads.
    return {
      label: <RelativeTime iso={updatedAt} className="font-mono-micro text-mono-micro" />,
      tone: "ochre-dark" as const
    };
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
          // The actual `trips` table schema (202604291900_…trips.sql):
          //   id, trip_brief_id, country_slug, title, status, visibility,
          //   is_paid, has_human_review, created_at, updated_at
          // There is no `brief` or `sla_hours` column. The brief lives
          // on the related `trip_briefs` row; a full join is out of
          // scope for the Realtime path, so the card body shows the
          // trip title + country, and the SLA badge is only emitted
          // for the fallback dataset (see FALLBACK_ITEMS).
          const next: PipelineItem = {
            id: row.id,
            title: typeof row.title === "string" ? row.title : "Untitled trip",
            body: typeof row.country_slug === "string"
              ? `Country: ${row.country_slug.replace(/-/g, " ")}`
              : "",
            clientName: typeof row.trip_brief_id === "string" || typeof row.trip_brief_id === "number"
              ? `Brief #${row.trip_brief_id}`
              : "—",
            // TODO(LOW-3): enrich with the real client name via a
            // trip_briefs join. Out of scope for the Realtime path;
            // needs a separate `consumer-name` enrichment pass.
            status: mapTripStatus(row.status),
            slaHours: null, // not on the trips table; fallback items only
            updatedAt: typeof row.updated_at === "string" ? row.updated_at : null
          };
          setItems((prev) => {
            const without = prev.filter((item) => item.id !== next.id);
            // eventType is the canonical field on
            // RealtimePostgresChangesPayload (v2 SDK). The single
            // helper avoids the repeated inline cast.
            if (eventTypeOf(payload) === "DELETE") return without;
            return [...without, next];
          });
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      // Capture the error from removeChannel — the previous
      // `void ...removeChannel(channel)` discarded both the
      // promise and any error, so a closed socket leaked silently.
      supabase
        .removeChannel(channel)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn("[pipeline] removeChannel failed:", err);
        });
    };
  }, []);

  const lanes = STATUS_ORDER.map((status) => ({
    status,
    ...STATUS_LABELS[status],
    items: items.filter((item) => item.status === status)
  }));

  // PR-14b: drag-and-drop between lanes. Visual + local-state only — the
  // server action that persists the stage change is out of scope for
  // this PR (see PR-9.4 in docs/roadmap.md). The PointerSensor activation
  // constraint of 6px prevents accidental drags on click.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const newStatus = over.id as PipelineItem["status"];
    if (!STATUS_ORDER.includes(newStatus)) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.status !== newStatus
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="flex-1 flex gap-gutter overflow-x-auto pb-4 rounded-xl"
        data-realtime={isLive ? "live" : "fallback"}
        data-testid="pipeline-board"
      >
        {lanes.map((lane) => (
          <DroppableLane
            key={lane.status}
            id={lane.status}
            title={lane.title}
            count={lane.items.length}
            dot={lane.dot}
          >
            {lane.items.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 italic px-3 py-4">No items in this lane.</p>
            ) : (
              lane.items.map((item) => (
                <DraggableCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  body={item.body}
                  clientName={item.clientName}
                  badge={statusToBadge(item.slaHours, item.updatedAt, item.status)}
                  avatar={{ initials: initialsFor(item.clientName), alt: `${item.clientName} initials` }}
                />
              ))
            )}
          </DroppableLane>
        ))}
      </div>
    </DndContext>
  );
}

function DraggableCard({
  id,
  title,
  body,
  clientName,
  badge,
  avatar
}: {
  id: string;
  title: string;
  body: string;
  clientName: string;
  badge: { label: React.ReactNode; tone: "error" | "ochre" | "ochre-dark" } | undefined;
  avatar: { initials: string; alt: string };
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  // dnd-kit's transform comes in pixels; apply it directly so the card
  // follows the cursor with no transition lag.
  const style: React.CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-60 cursor-grabbing" : "cursor-grab"}
    >
      <KanbanCard
        title={title}
        body={body}
        clientName={clientName}
        badge={badge}
        avatar={avatar}
      />
    </div>
  );
}

function DroppableLane({
  id,
  children,
  ...laneProps
}: {
  id: PipelineItem["status"];
  children: React.ReactNode;
  title: string;
  count: number;
  dot: "secondary" | "ochre" | "surface-tint";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl transition-shadow ${
        isOver ? "ring-2 ring-ochre-light shadow-md" : ""
      }`}
    >
      <KanbanLane {...laneProps}>{children}</KanbanLane>
    </div>
  );
}

function mapTripStatus(raw: unknown): PipelineItem["status"] {
  if (typeof raw !== "string") return "draft";
  if (raw === "in_review" || raw === "in_revision" || raw === "needs_revision") return "in_revision";
  if (raw === "active" || raw === "in_progress" || raw === "on_trip") return "active_chat";
  // Terminal-but-recent statuses default to the active_chat lane so
  // completed / cancelled / archived trips don't visually mis-classify
  // as "New Drafts". The exhaustive list lives here; add new upstream
  // statuses explicitly rather than relying on the fallthrough.
  if (raw === "completed" || raw === "cancelled" || raw === "archived") return "active_chat";
  return "draft";
}

/**
 * Extract the event type from a Supabase Realtime payload. The
 * v2 SDK types `RealtimePostgresChangesPayload` with `eventType`,
 * but earlier versions used `event`. This helper centralises the
 * read so the consumer doesn't need a cast at every call site.
 */
function eventTypeOf(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const obj = payload as { eventType?: unknown; event?: unknown };
  if (typeof obj.eventType === "string") return obj.eventType;
  if (typeof obj.event === "string") return obj.event;
  return undefined;
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
