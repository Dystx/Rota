"use client";

import * as React from "react";
import { DecisionStatePanel } from "@repo/ui";
import { DAYS } from "./_lib/conversations";

export default function ConsoleMessagesPage() {
  if (DAYS.length === 0) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden bg-background p-container-padding-sm lg:p-container-padding-lg">
        <header className="mb-6 border-b border-olive-light/15 pb-5">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
            Operator messages
          </p>
          <h1 className="mt-2 font-headline-lg text-headline-lg text-primary">Messaging hub</h1>
          <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Conversations are shown only when a persisted message source is available.
          </p>
        </header>
        <DecisionStatePanel
          kind="unavailable"
          headingLevel={2}
          title="Messaging data is unavailable"
          description="No persisted conversations are connected to this operator workspace, so illustrative threads are not shown."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-background p-container-padding-sm lg:p-container-padding-lg">
      <DecisionStatePanel
        kind="unavailable"
        headingLevel={1}
        title="Messaging data is unavailable"
        description="The conversation source is not available for this workspace."
      />
    </main>
  );
}
