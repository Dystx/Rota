import type { ReactNode } from "react";

export type KanbanLaneDot = "secondary" | "ochre" | "surface-tint";

const dotClass: Record<KanbanLaneDot, string> = {
  secondary: "bg-secondary-container",
  ochre: "bg-ochre-light",
  "surface-tint": "bg-surface-tint",
};

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
      className="flex-shrink-0 w-80 flex flex-col bg-glass-light border border-white/20 backdrop-blur-md rounded-xl p-card-padding shadow-sm"
    >
      <header className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
          <span
            aria-hidden
            className={`w-2 h-2 rounded-full ${dotClass[dot]}`}
          />
          {title}
        </h3>
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