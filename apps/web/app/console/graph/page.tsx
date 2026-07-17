import * as React from "react";
import { DecisionStatePanel } from "@repo/ui";

export default function ConsoleGraphPage() {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-olive-dark p-container-padding-sm text-linen-dark lg:p-container-padding-lg">
      <header className="mb-6 border-b border-white/10 pb-5">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
          Knowledge graph
        </p>
        <h1 className="mt-2 font-headline-lg text-headline-lg text-linen-dark">Graph evidence</h1>
        <p className="mt-2 max-w-2xl font-body-md text-body-md text-linen-dark/70">
          Places, regions, and relationships appear here only when the persisted graph source is connected.
        </p>
      </header>
      <div data-testid="console-graph">
        <DecisionStatePanel
          kind="unavailable"
          tone="inverse"
          headingLevel={2}
          title="Knowledge graph is unavailable"
          description="No persisted graph evidence is available, so vectors, counts, and map coordinates are not presented as operational data."
        />
      </div>
    </div>
  );
}
