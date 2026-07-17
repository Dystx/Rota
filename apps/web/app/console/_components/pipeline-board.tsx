"use client";

import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { DecisionStatePanel, Icon } from "@repo/ui";
import { KanbanCard } from "./kanban-card";
import { KanbanLane } from "./kanban-lane";
import { RelativeTime } from "./relative-time";

export interface PipelineItem {
  id: string;
  title: string;
  body: string;
  clientName: string;
  status: "draft" | "in_revision" | "active_chat";
  slaHours: number | null;
  updatedAt: string | null;
}

export type PipelineBoardState =
  | { kind: "ready"; items: readonly PipelineItem[] }
  | { kind: "empty" }
  | { kind: "unavailable" };

interface PipelineBoardProps {
  state?: PipelineBoardState;
  /** Kept for callers that already shape a persisted item list. */
  initialItems?: readonly PipelineItem[];
  query?: string;
  statusFilter?: "all" | PipelineItem["status"];
  /** The explicit lane selected by the mobile view switcher. */
  mobileStatus?: "all" | PipelineItem["status"];
}

const STATUS_LABELS: Record<
  PipelineItem["status"],
  { title: string; dot: "secondary" | "ochre" | "surface-tint" }
> = {
  draft: { title: "New activity evidence", dot: "secondary" },
  in_revision: { title: "Needs editorial revision", dot: "ochre" },
  active_chat: { title: "Reviewer follow-up", dot: "surface-tint" }
};

const STATUS_ORDER: PipelineItem["status"][] = ["draft", "in_revision", "active_chat"];

function statusToBadge(
  slaHours: number | null,
  updatedAt: string | null,
  status: PipelineItem["status"]
) {
  if (slaHours !== null && status === "draft") {
    return {
      label: `SLA: ${slaHours}h`,
      tone: slaHours <= 4 ? ("error" as const) : ("ochre" as const)
    };
  }
  if (updatedAt && status === "in_revision") {
    return {
      label: <RelativeTime iso={updatedAt} className="font-mono-micro text-mono-micro" />,
      tone: "ochre-dark" as const
    };
  }
  return undefined;
}

function resolveState(
  state: PipelineBoardState | undefined,
  initialItems: readonly PipelineItem[] | undefined
): PipelineBoardState {
  if (state) return state;
  if (initialItems && initialItems.length > 0) return { kind: "ready", items: initialItems };
  return { kind: "empty" };
}

export function PipelineBoard({
  state,
  initialItems,
  query = "",
  statusFilter = "all",
  mobileStatus = "all"
}: PipelineBoardProps) {
  const resolvedState = React.useMemo(() => resolveState(state, initialItems), [state, initialItems]);
  const [items, setItems] = React.useState<PipelineItem[]>(() =>
    resolvedState.kind === "ready" ? [...resolvedState.items] : []
  );
  const [savingIds, setSavingIds] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<
    | { kind: "ok"; message: string }
    | { kind: "error"; message: string }
    | null
  >(null);

  React.useEffect(() => {
    setItems(resolvedState.kind === "ready" ? [...resolvedState.items] : []);
    setSavingIds(new Set());
    setToast(null);
  }, [resolvedState]);

  React.useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const trimmedQuery = query.trim().toLowerCase();
  const matchesQuery = (item: PipelineItem) => {
    if (!trimmedQuery) return true;
    return [item.title, item.body, item.clientName].some((value) =>
      value.toLowerCase().includes(trimmedQuery)
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

  function persistMove(itemId: string, nextStatus: PipelineItem["status"]) {
    if (resolvedState.kind !== "ready") return;
    if (!STATUS_ORDER.includes(nextStatus)) return;

    const previous = items.find((item) => item.id === itemId);
    if (!previous || previous.status === nextStatus) return;

    const nextLabel = STATUS_LABELS[nextStatus].title;
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, status: nextStatus } : item))
    );
    setSavingIds((current) => new Set(current).add(itemId));

    void fetch("/api/console/pipeline/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: itemId, toStatus: nextStatus })
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (!response.ok || data.ok !== true) {
          throw new Error(data.message ?? `HTTP ${response.status}`);
        }
      })
      .then(() => setToast({ kind: "ok", message: `Move saved in ${nextLabel}.` }))
      .catch(() => {
        setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, status: previous.status } : item))
        );
        setToast({ kind: "error", message: `Could not save the move to ${nextLabel}; it was reverted.` });
      })
      .finally(() => {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(itemId);
          return next;
        });
      });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return;
    const nextStatus = event.over.id as PipelineItem["status"];
    if (!STATUS_ORDER.includes(nextStatus)) return;
    persistMove(String(event.active.id), nextStatus);
  }

  if (resolvedState.kind === "unavailable") {
    return (
      <DecisionStatePanel
        kind="unavailable"
        headingLevel={2}
        title="Pipeline is unavailable"
        description="The persisted activity feed is not available, so no operational cards or move actions are shown."
      />
    );
  }

  if (resolvedState.kind === "empty" || items.length === 0) {
    return (
      <DecisionStatePanel
        kind="empty"
        headingLevel={2}
        title="No activity evidence is queued"
        description="Persisted activity review items will appear here when the operator feed has work to show."
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex min-w-0 flex-1 flex-col gap-3" data-testid="pipeline-board">
        <div
          data-testid="pipeline-data-source"
          aria-live="polite"
          className="w-full rounded-md border border-olive-light/30 bg-olive-light/10 px-3 py-1.5 font-mono-technical text-[11px] text-olive-dark"
        >
          Persisted operator feed · moves require server confirmation
        </div>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex min-h-[1.75rem] items-center px-1"
          data-testid="pipeline-toast"
        >
          {toast ? (
            <div
              role={toast.kind === "error" ? "alert" : "status"}
              className={
                toast.kind === "error"
                  ? "flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-mono-technical text-[12px] text-red-800"
                  : "flex items-center gap-2 rounded-md border border-olive-light/40 bg-olive-light/15 px-3 py-1.5 font-mono-technical text-[12px] text-olive-dark"
              }
            >
              <Icon name={toast.kind === "error" ? "error" : "check_circle"} className="text-[14px]" />
              <span>{toast.message}</span>
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 gap-gutter overflow-x-auto pb-4">
          {lanes.map((lane) => {
            const mobileHidden = mobileStatus !== "all" && lane.status !== mobileStatus;
            return (
              <div
                key={lane.status}
                className={`min-w-[min(19rem,calc(100vw-2rem))] flex-1 ${mobileHidden ? "hidden lg:block" : "block"}`}
              >
                <DroppableLane
                  id={lane.status}
                  title={lane.title}
                  count={lane.items.length}
                  dot={lane.dot}
                >
                  {lane.items.length === 0 ? (
                    <p data-testid="lane-empty" className="px-3 py-4 text-xs italic text-on-surface-variant/60">
                      No persisted items in this lane.
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
                        currentStatus={item.status}
                        onMove={(nextStatus) => persistMove(item.id, nextStatus)}
                      />
                    ))
                  )}
                </DroppableLane>
              </div>
            );
          })}
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
  saving,
  currentStatus,
  onMove
}: {
  id: string;
  title: string;
  body: string;
  clientName: string;
  badge: { label: React.ReactNode; tone: "error" | "ochre" | "ochre-dark" } | undefined;
  avatar: { initials: string; alt: string };
  saving: boolean;
  currentStatus: PipelineItem["status"];
  onMove: (status: PipelineItem["status"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style: React.CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative ${isDragging ? "cursor-grabbing opacity-60" : "cursor-grab"}`}
      data-testid="pipeline-card"
      data-saving={saving ? "true" : "false"}
    >
      <KanbanCard
        title={title}
        body={body}
        clientName={clientName}
        badge={badge}
        avatar={avatar}
        interactive={false}
      />
      <label className="mt-2 block px-2 pb-2 font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
        <span className="sr-only">Move {title}</span>
        <select
          aria-label={`Move ${title}`}
          value={currentStatus}
          disabled={saving}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onMove(event.target.value as PipelineItem["status"])}
          className="min-h-11 w-full rounded-md border border-outline-variant/60 bg-white/70 px-2 py-1 font-label-ui text-label-ui normal-case tracking-normal text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status].title}</option>
          ))}
        </select>
      </label>
      {saving ? (
        <span
          aria-live="polite"
          data-testid="pipeline-card-saving"
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-ochre-light/50 bg-ochre-light/20 px-2 py-0.5 font-mono-technical text-[10px] uppercase tracking-widest text-ochre-dark"
        >
          <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-ochre-dark" />
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
    <div ref={setNodeRef} className={`rounded-xl transition-shadow ${isOver ? "ring-2 ring-ochre-light shadow-md" : ""}`}>
      <KanbanLane {...laneProps}>{children}</KanbanLane>
    </div>
  );
}

function initialsFor(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
