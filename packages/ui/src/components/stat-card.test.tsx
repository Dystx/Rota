import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard, StatCardGrid } from "./stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Active trips" value="128" />);
    expect(screen.getByText("Active trips")).toBeDefined();
    expect(screen.getByText("128")).toBeDefined();
  });

  it("renders helper text when provided", () => {
    render(
      <StatCard label="Confirmed" value="64" helper="vs. 58 last week" />
    );
    expect(screen.getByText("vs. 58 last week")).toBeDefined();
  });

  it("renders trend with up direction styling", () => {
    const { container } = render(
      <StatCard
        label="Reviewer load"
        value="22"
        trend={{ direction: "up", label: "+8%" }}
      />
    );
    expect(screen.getByText("+8%")).toBeDefined();
    const trendNode = container.querySelector("[data-trend='up']");
    expect(trendNode).not.toBeNull();
  });

  it("renders trend with down direction", () => {
    const { container } = render(
      <StatCard
        label="Refund rate"
        value="1.2%"
        trend={{ direction: "down", label: "-0.4 pts" }}
      />
    );
    expect(container.querySelector("[data-trend='down']")).not.toBeNull();
  });

  it("renders trend with flat direction", () => {
    const { container } = render(
      <StatCard
        label="Open queues"
        value="3"
        trend={{ direction: "flat", label: "no change" }}
      />
    );
    expect(container.querySelector("[data-trend='flat']")).not.toBeNull();
  });

  it("applies tone via data-tone for downstream styling", () => {
    const { container } = render(
      <StatCard label="Failures" value="2" tone="danger" />
    );
    expect((container.firstChild as HTMLElement).dataset.tone).toBe("danger");
  });

  it("renders skeleton instead of value when loading", () => {
    render(<StatCard label="Loading" value="-" isLoading />);
    expect(screen.getByTestId("statcard-skeleton")).toBeDefined();
  });

  it("renders the icon node when provided", () => {
    render(
      <StatCard
        label="Bookings"
        value="42"
        icon={<span data-testid="icon-node">★</span>}
      />
    );
    expect(screen.getByTestId("icon-node")).toBeDefined();
  });
});

describe("StatCardGrid", () => {
  it("renders all child stat cards", () => {
    render(
      <StatCardGrid>
        <StatCard label="A" value="1" />
        <StatCard label="B" value="2" />
        <StatCard label="C" value="3" />
      </StatCardGrid>
    );
    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
    expect(screen.getByText("C")).toBeDefined();
  });

  it("applies responsive grid classes", () => {
    const { container } = render(
      <StatCardGrid>
        <StatCard label="A" value="1" />
      </StatCardGrid>
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "sm:grid-cols-2"
    );
  });
});
