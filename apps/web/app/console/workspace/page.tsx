"use client";

import * as React from "react";
import { DecisionStatePanel } from "@repo/ui";
import { ConsoleMobileViewSwitcher } from "../_components/console-mobile-view-switcher";

type WorkspacePane = "anchors" | "timeline" | "validation";

const WORKSPACE_VIEWS = [
  { value: "anchors", label: "Anchors" },
  { value: "timeline", label: "Timeline" },
  { value: "validation", label: "Validation" }
] as const;

function paneClass(pane: WorkspacePane, activePane: WorkspacePane) {
  return `${pane === activePane ? "block" : "hidden"} min-w-0 min-h-[24rem] lg:min-h-0 lg:block`;
}

export default function ConsoleWorkspacePage() {
  const [activePane, setActivePane] = React.useState<WorkspacePane>("anchors");

  return (
    <div
      data-testid="console-workspace-content"
      className="min-w-0 overflow-x-hidden"
    >
      <header className="mb-5 flex min-w-0 flex-col gap-3 border-b border-olive-light/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
            Operator workspace
          </p>
          <h1 className="mt-2 truncate font-headline-lg text-headline-lg text-primary">
            Revision workspace
          </h1>
          <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
            A persisted trip selection is required before anchors, timeline, or validation can be edited.
          </p>
        </div>
        <span className="inline-flex min-h-11 items-center rounded-full border border-ochre-light/50 bg-ochre-light/10 px-3 py-2 font-label-ui text-label-ui text-ochre-dark">
          Workspace data unavailable
        </span>
      </header>

      <div className="mb-4 lg:hidden">
        <ConsoleMobileViewSwitcher
          value={activePane}
          onChange={(value) => setActivePane(value as WorkspacePane)}
          views={WORKSPACE_VIEWS}
          label="Workspace view"
        />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)_minmax(15rem,20rem)]">
        <aside data-testid="workspace-anchors" className={paneClass("anchors", activePane)}>
          <DecisionStatePanel
            kind="unavailable"
            headingLevel={2}
            title="Client anchors unavailable"
            description="No persisted trip is selected for this workspace, so client constraints are not shown as if they were real."
            className="min-h-[20rem] lg:min-h-[22rem]"
          />
        </aside>

        <section data-testid="workspace-timeline" className={paneClass("timeline", activePane)}>
          <DecisionStatePanel
            kind="unavailable"
            headingLevel={2}
            title="Timeline unavailable"
            description="Select a persisted trip before timeline events or editorial actions can be loaded."
            className="min-h-[20rem] lg:min-h-[22rem]"
          />
        </section>

        <aside data-testid="workspace-validation" className={paneClass("validation", activePane)}>
          <DecisionStatePanel
            kind="unavailable"
            headingLevel={2}
            title="Validation unavailable"
            description="Validation checks require persisted itinerary evidence and are not fabricated here."
            className="min-h-[20rem] lg:min-h-[22rem]"
          />
        </aside>
      </div>
    </div>
  );
}
