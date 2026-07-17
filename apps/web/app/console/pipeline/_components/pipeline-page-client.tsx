"use client";

import * as React from "react";
import { ConsoleMobileViewSwitcher } from "../../_components/console-mobile-view-switcher";
import { PipelineBoard, type PipelineBoardState, type PipelineItem } from "../../_components/pipeline-board";
import { PipelineHeader } from "./pipeline-header";

type StatusFilter = "all" | PipelineItem["status"];

export function PipelinePageClient({
  state,
  initialItems
}: {
  state?: PipelineBoardState;
  initialItems?: PipelineItem[];
}) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [mobileStatus, setMobileStatus] = React.useState<StatusFilter>("all");

  const mobileViews = [
    { value: "all", label: "All lanes" },
    { value: "draft", label: "New evidence" },
    { value: "in_revision", label: "Revision" },
    { value: "active_chat", label: "Follow-up" }
  ] as const;

  return (
    <>
      <header className="mb-section-gap flex min-w-0 shrink-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Activity review</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Triage verdicts, source freshness, and reviewer follow-up.
          </p>
        </div>
        <PipelineHeader
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </header>

      <div data-testid="pipeline-mobile-view-switcher" className="mb-4">
        <ConsoleMobileViewSwitcher
          value={mobileStatus}
          onChange={(value) => setMobileStatus(value as StatusFilter)}
          views={mobileViews}
          label="Pipeline lane"
        />
      </div>

      <div
        className="rumia-pipeline-board-field flex min-w-0 w-full flex-1 gap-gutter overflow-x-auto rounded-xl bg-surface-container-lowest/50 pb-4"
        tabIndex={0}
        role="region"
        aria-label="Activity review board"
      >
        <PipelineBoard
          state={state}
          initialItems={initialItems}
          query={query}
          statusFilter={statusFilter}
          mobileStatus={mobileStatus}
        />
      </div>
    </>
  );
}
