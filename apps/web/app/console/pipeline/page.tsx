import * as React from "react";
import { listPostgresTripDrafts } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import type { PipelineBoardState, PipelineItem } from "../_components/pipeline-board";
import { PipelinePageClient } from "./_components/pipeline-page-client";

function mapStatus(status: string): PipelineItem["status"] {
  if (status === "in_review") return "in_revision";
  if (status === "active" || status === "reviewed" || status === "paid") return "active_chat";
  return "draft";
}

async function loadPipelineState(): Promise<PipelineBoardState> {
  try {
    const admin = await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
    if (!isAdminPageAuthContext(admin)) return { kind: "unavailable" };

    const trips = await listPostgresTripDrafts(100, admin.actor);
    if (trips.length === 0) return { kind: "empty" };

    return {
      kind: "ready",
      items: trips.map((trip) => ({
        id: trip.id,
        title: trip.title,
        body: trip.brief.rawBrief.trim() || "Saved itinerary brief.",
        clientName: trip.ownerUserId ? "Assigned traveler" : "Unassigned traveler",
        status: mapStatus(trip.status),
        slaHours: null,
        updatedAt: null
      }))
    };
  } catch {
    return { kind: "unavailable" };
  }
}

export default async function ConsolePipelinePage() {
  const state = await loadPipelineState();

  return (
    <>
      <div className="min-w-0 min-h-screen flex flex-col bg-background overflow-x-hidden">
        <div className="flex-1 min-w-0 p-container-padding-lg overflow-hidden flex flex-col">
          <PipelinePageClient state={state} />
        </div>
      </div>
      <style>{`
        .rumia-operator-main ::-webkit-scrollbar { width: 6px; height: 6px; }
        .rumia-operator-main ::-webkit-scrollbar-thumb { background-color: rgba(60, 84, 71, 0.2); border-radius: 9999px; }
        .rumia-operator-main ::-webkit-scrollbar-track { background-color: transparent; }
      `}</style>
    </>
  );
}
