"use client";

/**
 * PipelinePageClient — small client island that owns the
 * pipeline search + filter state and passes it to the board.
 *
 * Lifting state into a client component (rather than the page
 * itself) keeps the page a server component while still wiring
 * the page-level search input to the board-level filter.
 */

import * as React from "react";
import { PipelineBoard, type PipelineItem } from "../../_components/pipeline-board";
import { PipelineHeader } from "./pipeline-header";

type StatusFilter = "all" | PipelineItem["status"];

export function PipelinePageClient({ initialItems }: { initialItems?: PipelineItem[] }) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  return (
    <>
      <header className="mb-section-gap flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Operations Pipeline
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage active itineraries and client communications.
          </p>
        </div>
        <PipelineHeader
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </header>

      <div
        className="flex-1 flex gap-gutter overflow-x-auto pb-4 rounded-xl"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlOGZmZjAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZHRoPSIxIiBmaWxsPSJyZ2JhKDQzLCA2MiwgNTIsIDAuMSkiLz48L3N2Zz4=\")"
        }}
        tabIndex={0}
        role="region"
        aria-label="Operations pipeline board"
      >
        <PipelineBoard
          initialItems={initialItems}
          query={query}
          statusFilter={statusFilter}
        />
      </div>
    </>
  );
}
