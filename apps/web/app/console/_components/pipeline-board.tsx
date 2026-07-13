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
import { KanbanCard } from "./kanban-card";
import { KanbanLane } from "./kanban-lane";
import { RelativeTime } from "./relative-time";
import { Icon } from "@repo/ui";

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
  /** Server-rendered fallback while the operator feed is not enabled. */
  initialItems?: PipelineItem[];
  /** Free-text query from the page header search input.
   *  Filters by title, body, and clientName (case-insensitive). */
  query?: string;
  /** Status filter from the page header filter button.
   *  "all" shows every lane; a specific status hides the others. */
  statusFilter?: "all" | PipelineItem["status"];
}

const FALLBACK_ITEMS: PipelineItem[] = [
  {
    id: "fallback-sintra",
    title: "Sintra Day Trip",
    body: "Family of 4. Wants Pena Palace at golden hour, a quiet Quinta for lunch, and a cab back from Cascais by 7pm.",
    clientName: "M. Silva",
    status: "draft",
    slaHours: 2,
    updatedAt: null
  },
  {
    id: "fallback-douro",
    title: "Douro Valley Hike",
    body: "Couple, both 30s. Seven-day hiking route from Peso da Régua to Pinhão, two vineyard stops with a sommelier.",
    clientName: "J. Santos",
    status: "draft",
    slaHours: 12,
    updatedAt: null
  },
  {
    id: "fallback-comporta",
    title: "Comporta Beach Week",
    body: "Reviewing proposed boat day on the Sado estuary and dinner at a rice-fish-farm restaurant in Melides.",
    clientName: "P. Costa",
    status: "in_revision",
    slaHours: null,
    updatedAt: new Date(Date.now() - 10 * 60_000).toISOString()
  },
  {
    id: "fallback-azores",
    title: "São Miguel & Azores",
    body: "Can we add a full-day sailing charter out of Ponta Delgada? Flight times look good.",
    clientName: "L. Almeida",
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

export function PipelineBoard({
  initialItems = FALLBACK_ITEMS,
  query = "",
  statusFilter = "all"
}: PipelineBoardProps) {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  // Track presence of the realtime subscription so the UI can show
  // a small "live" indicator when the channel is connected.
  const [isLive, setIsLive] = useState(false);
  // UX Pass 1: ids currently being persisted. The card renders
  // a subtle "saving" state while the POST is in flight, and
  // a success/error toast appears once the request settles.
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<
    | { kind: "ok"; message: string }
    | { kind: "error"; message: string }
    | null
  >(null);

  // Auto-dismiss the toast after 4s. A short window keeps the
  // board clean; the operator can re-trigger by trying again.
  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(handle);
  }, [toast]);

  // Stitch 1.4 / Phase D: the page header search + filter drive
  // which lanes and which cards surface. Filtering is intentionally
  // cheap (in-memory) — the demo dataset is tiny and the same
  // pattern scales to a few hundred items without virtualization.
  const trimmedQuery = query.trim().toLowerCase();
  const matchesQuery = (item: PipelineItem) => {
    if (!trimmedQuery) return true;
    return (
      item.title.toLowerCase().includes(trimmedQuery) ||
      item.body.toLowerCase().includes(trimmedQuery) ||
      item.clientName.toLowerCase().includes(trimmedQuery)
    );
  };
  const lanes = STATUS_ORDER.map((status) => ({
    status,
    ...STATUS_LABELS[status],
    items: items.filter(
      (item) =>
        item.status === status &&
        matchesQuery(item) &&
        (statusFilter === "all" || statusFilter === status)
    )
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

    // Find the prior status for the optimistic update and
    // server-action body — we need it to detect "no change" and
    // to roll back the optimistic move on failure.
    const previous = items.find((item) => item.id === itemId);
    if (!previous || previous.status === newStatus) return;

    const previousLabel = STATUS_LABELS[previous.status].title;
    const nextLabel = STATUS_LABELS[newStatus].title;

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    // Skip persistence for fallback items: their ids start with
    // "fallback-" and don't exist in the `trips` table. Still
    // surface a success toast so the operator gets feedback.
    if (itemId.startsWith("fallback-")) {
      setToast({
        kind: "ok",
        message: `Moved to ${nextLabel} (demo data — not persisted).`
      });
      return;
    }

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    void fetch("/api/console/pipeline/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: itemId, toStatus: newStatus }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? `HTTP ${response.status}`);
        }
      })
      .then(() => {
        setToast({
          kind: "ok",
          message: `Moved to ${nextLabel}.`
        });
      })
      .catch((error: unknown) => {
        // Roll back the optimistic update on failure.
        // eslint-disable-next-line no-console
        console.warn("[pipeline] failed to persist move:", error);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, status: previous.status } : item
          )
        );
        setToast({
          kind: "error",
          message: `Couldn't save move to ${nextLabel} — reverted to ${previousLabel}.`
        });
      })
      .finally(() => {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="flex-1 flex flex-col gap-3"
        data-realtime={isLive ? "live" : "fallback"}
        data-testid="pipeline-board"
      >
        {/* UX Pass 2: live/demo data indicator. Surfaces whether
            the board is showing live operator data or the
            fallback fixtures (demo). Without this, the operator
            can't tell whether their drag is being persisted. */}
        <div
          data-testid="pipeline-data-source"
          aria-live="polite"
          className={
            isLive
              ? "px-3 py-1.5 rounded-md bg-olive-light/15 border border-olive-light/40 text-olive-dark font-mono-technical text-[11px] flex items-center gap-2 self-start"
              : "px-3 py-1.5 rounded-md bg-ochre-light/15 border border-ochre-light/40 text-ochre-dark font-mono-technical text-[11px] flex items-center gap-2 self-start"
          }
        >
          <span
            aria-hidden
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-olive-light animate-pulse" : "bg-ochre-dark"
            }`}
          />
          <span>
            {isLive
              ? "Live · connected to operator feed"
              : "Demo data · live updates are intentionally disabled until the operator feed is enabled"}
          </span>
        </div>
        {/* UX Pass 1: inline toast above the board. `aria-live`
            so screen readers announce the outcome. `role="alert"`
            on the failure variant for assertive announcement. */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="px-1 min-h-[1.75rem] flex items-center"
          data-testid="pipeline-toast"
        >
          {toast ? (
            <div
              role={toast.kind === "error" ? "alert" : "status"}
              className={
                toast.kind === "error"
                  ? "px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-800 font-mono-technical text-[12px] flex items-center gap-2"
                  : "px-3 py-1.5 rounded-md bg-olive-light/15 border border-olive-light/40 text-olive-dark font-mono-technical text-[12px] flex items-center gap-2"
              }
            >
              <Icon name={toast.kind === "error" ? "error" : "check_circle"} className="text-[14px]" />
              <span>{toast.message}</span>
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 gap-gutter overflow-x-auto pb-4 rounded-xl">
          {/* Phase D: hide lanes that are filtered out (rather than
              rendering them empty) so the operator's focus stays
              on the active column when statusFilter !== "all". */}
          {lanes
            .filter((lane) => statusFilter === "all" || lane.status === statusFilter)
            .map((lane) => (
            <DroppableLane
              key={lane.status}
              id={lane.status}
              title={lane.title}
              count={lane.items.length}
              dot={lane.dot}
            >
              {lane.items.length === 0 ? (
                <p
                  data-testid="lane-empty"
                  className="text-xs text-on-surface-variant/60 italic px-3 py-4"
                >
                  No items in this lane.
                </p>
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
                    saving={savingIds.has(item.id)}
                  />
                ))
              )}
            </DroppableLane>
          ))}
        </div>
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
  avatar,
  saving
}: {
  id: string;
  title: string;
  body: string;
  clientName: string;
  badge: { label: React.ReactNode; tone: "error" | "ochre" | "ochre-dark" } | undefined;
  avatar: { initials: string; alt: string };
  saving?: boolean;
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
      className={`relative ${isDragging ? "opacity-60 cursor-grabbing" : "cursor-grab"}`}
      data-testid="pipeline-card"
      data-saving={saving ? "true" : "false"}
    >
      <KanbanCard
        title={title}
        body={body}
        clientName={clientName}
        badge={badge}
        avatar={avatar}
      />
      {saving ? (
        <span
          aria-live="polite"
          data-testid="pipeline-card-saving"
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ochre-light/20 border border-ochre-light/50 text-ochre-dark font-mono-technical text-[10px] uppercase tracking-widest"
        >
          <span
            aria-hidden
            className="w-2 h-2 rounded-full bg-ochre-dark animate-pulse"
          />
          Saving
        </span>
      ) : null}
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
