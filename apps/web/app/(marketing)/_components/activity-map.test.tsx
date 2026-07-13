import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildActivityMapModel, type ActivityMapPoint } from "./activity-map-model";
import { ActivityMap } from "./activity-map";
import { ActivityMapFallback } from "./activity-map-fallback";

const reviewedPoint: ActivityMapPoint = {
  activityId: "porto-ribeira-slow-walk",
  title: "Ribeira and Miragaia at walking pace",
  region: "porto",
  coordinates: { lng: -8.611, lat: 41.14 },
  locality: "Porto",
  geometryPrecision: "approximate",
  locationPrivacy: "coarse",
  editorialStatus: "reviewed",
  reviewedAt: "2026-07-10",
  verdict: "A slow first read of Porto.",
  bestFor: ["a walk"],
  durationMinutes: 120,
  bestTime: "Late afternoon",
  avoidWhen: null,
  bookingNeed: "none",
  pairWith: ["A simple dinner"],
  alternativeId: null,
  weatherFit: ["sun", "either"],
  effortLevel: "moderate",
  costBand: "free",
  mobilityNotes: "Hills and cobbles are part of the experience.",
  evidenceUrl: "https://example.test/ribeira",
  evidenceAttribution: "Visit Portugal; Rumia editorial review"
};

vi.mock("@repo/spatial-engine", () => ({
  emitMapTelemetry: (handler: ((event: unknown) => void) | undefined, event: unknown) => handler?.(event),
  WorkspaceCanvas: React.forwardRef(function MockWorkspaceCanvas(
    props: {
      onActivitySelect?: (activityId: string) => void;
      onMapTelemetry?: (event: unknown) => void;
      showBuildingExtrusions?: boolean;
      styleOverride?: { id?: string };
      testId?: string;
    },
    ref: React.ForwardedRef<{ fitBounds: () => Promise<void>; resetNorth: () => void }>
  ) {
    React.useImperativeHandle(ref, () => ({ fitBounds: async () => undefined, resetNorth: () => undefined }), []);
    return (
      <div
        data-testid={props.testId ?? "workspace-canvas"}
        data-3d-requested={props.showBuildingExtrusions ? "true" : "false"}
        data-style-id={props.styleOverride?.id ?? "default"}
        role="application"
        aria-label="Mock activity map"
      >
        <button type="button" onClick={() => props.onActivitySelect?.("porto-ribeira-slow-walk")}>Select marker</button>
      </div>
    );
  })
}));

afterEach(() => cleanup());

describe("ActivityMapFallback", () => {
  it("keeps every selected activity keyboard-accessible and labels approximate points", () => {
    const second = { ...reviewedPoint, activityId: "second", title: "Second stop" };
    const model = buildActivityMapModel([reviewedPoint, second]);
    const onSelect = vi.fn();

    render(<ActivityMapFallback model={model} selectedActivityId={reviewedPoint.activityId} onSelectActivity={onSelect} />);

    expect(screen.getByRole("list", { name: /selected activities/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ribeira and Miragaia/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Second stop/i })).toBeTruthy();
    expect(screen.getAllByText(/approximate public area/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Source: Visit Portugal; Rumia editorial review/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Second stop/i }));
    expect(onSelect).toHaveBeenCalledWith("second");
  });
});

describe("ActivityMap", () => {
  it("provides explicit map controls, attribution, and marker-to-card selection", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <ActivityMap
        activities={[reviewedPoint]}
        selectedActivityId={reviewedPoint.activityId}
        onSelectActivity={onSelect}
        onClose={onClose}
      />
    );

    expect(screen.getByRole("application", { name: /activity map/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /View list/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Fit this day/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reset north/i })).toBeTruthy();
    expect(screen.getAllByText(/OpenStreetMap/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Select marker" }));
    expect(onSelect).toHaveBeenCalledWith(reviewedPoint.activityId);
    fireEvent.click(screen.getByRole("button", { name: /View list/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("forwards the optional 3D request and bounded map telemetry", () => {
    const telemetry = vi.fn();
    render(
      <ActivityMap
        activities={[reviewedPoint]}
        selectedActivityId={reviewedPoint.activityId}
        onSelectActivity={vi.fn()}
        onClose={vi.fn()}
        showBuildingExtrusions
        onMapTelemetry={telemetry}
      />
    );

    expect(screen.getByTestId("activity-map-canvas").getAttribute("data-3d-requested")).toBe("true");
    expect(telemetry).toHaveBeenCalledWith({
      type: "intent",
      surface: "activity-map",
      intent: "explicit-open"
    });
  });

  it("keeps provider style and attribution decisions injectable", () => {
    render(
      <ActivityMap
        activities={[reviewedPoint]}
        selectedActivityId={reviewedPoint.activityId}
        onSelectActivity={vi.fn()}
        provider={{
          style: {
            id: "rumia-reviewed-provider",
            name: "Reviewed provider",
            url: "https://maps.example.test/style.json"
          },
          attribution: {
            links: [{ label: "Reviewed map licence", href: "https://maps.example.test/licence" }],
            note: "Provider attribution is reviewed before release."
          }
        }}
      />
    );

    expect(screen.getByTestId("activity-map-canvas").getAttribute("data-style-id")).toBe("rumia-reviewed-provider");
    expect(screen.getAllByRole("link", { name: "Reviewed map licence" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "CARTO" })).toBeNull();
  });

  it("uses the complete semantic fallback when a selected point cannot be mapped", () => {
    const unmapped = {
      id: "unmapped",
      placeId: "private-home",
      region: "porto" as const,
      title: "Unmapped reviewed activity",
      verdict: "Keep the editorial card visible.",
      bestFor: [],
      durationMinutes: 60,
      bestTime: "Morning",
      avoidWhen: null,
      bookingNeed: "none" as const,
      pairWith: [],
      alternativeId: null,
      weatherFit: ["either"] as const,
      editorialStatus: "reviewed" as const,
      reviewedAt: "2026-07-10",
      evidenceUrl: "https://example.test/unmapped"
    };

    render(<ActivityMap activities={[unmapped]} selectedActivityId="unmapped" onSelectActivity={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByRole("application", { name: /activity map/i })).toBeNull();
    expect(screen.getByText("Unmapped reviewed activity")).toBeTruthy();
    expect(screen.getByText(/map location evidence/i)).toBeTruthy();
  });
});
