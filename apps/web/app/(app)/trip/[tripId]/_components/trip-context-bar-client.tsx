"use client";

import * as React from "react";
import { TripContextBar, type TripContextValues } from "@repo/ui";

export function TripContextBarClient({ draft, tripState = "preview" }: { draft: TripContextValues; tripState?: "draft" | "preview" | "unlocked" | "review" }) {
  const [sheet, setSheet] = React.useState<keyof TripContextValues | null>(null);
  const editHref = sheet ? `/planner?edit=${encodeURIComponent(String(sheet))}` : "/planner";
  return (
    <>
      <TripContextBar draft={draft} tripState={tripState} onEdit={setSheet} />
      {sheet ? (
        <div role="dialog" aria-modal="true" aria-label={`Edit ${sheet}`} className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-4" onClick={() => setSheet(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Edit {sheet}</h2><button type="button" aria-label="Close" onClick={() => setSheet(null)} className="min-h-11 rounded-full px-3">×</button></div>
            <p className="mt-3 text-sm text-on-surface-variant">Update {sheet} in the matching planner section, then regenerate this route.</p>
            <a href={editHref} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-olive-light px-5 text-white">Edit {sheet} in planner</a>
          </div>
        </div>
      ) : null}
    </>
  );
}
