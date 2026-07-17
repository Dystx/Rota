import type { ReactNode } from "react";

export type KanbanLaneDot = "secondary" | "ochre" | "surface-tint";

const dotClass: Record<KanbanLaneDot, string> = {
  secondary: "bg-secondary-container",
  ochre: "bg-ochre-light",
  "surface-tint": "bg-surface-tint",
};

import * as React from "react";

export interface KanbanLaneProps {
  title: string;
  count: number;
  dot: KanbanLaneDot;
  children: ReactNode;
}

export function KanbanLane({ title, count, dot, children }: KanbanLaneProps) {
  return (
    <section
      aria-label={`${title} lane`}
      data-testid="kanban-lane"
      className="flex min-w-0 shrink-0 flex-col rounded-xl border border-olive-light/15 bg-white/55 p-card-padding shadow-sm backdrop-blur-md w-[min(20rem,calc((100vw-23rem)/3))] max-md:w-[min(20rem,calc(100vw-5rem))]"
    >
      <header className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
          <span
            aria-hidden
            className={`w-2 h-2 rounded-full ${dotClass[dot]}`}
          />
          {title}
        </h2>
        <span
          className="font-mono-technical text-mono-technical text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full"
          aria-label={`${count} items`}
        >
          {count}
        </span>
      </header>
      <div className="flex flex-col gap-gutter overflow-y-auto pr-1">
        {children}
      </div>
    </section>
  );
}
