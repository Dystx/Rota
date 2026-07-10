import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OfflineStatus } from "./offline-status";

describe("OfflineStatus", () => {
  it("reports the absence of cached trips without promising unavailable content", () => {
    render(<OfflineStatus online={false} cachedPacks={[]} onRetry={vi.fn()} safeHref="/offline" />);
    expect(screen.getByText(/no trip packs are cached/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
  });
});
