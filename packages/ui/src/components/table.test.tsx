import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DataTable,
  StatusPill,
  type DataTableColumn,
  type DataTableRowAction,
} from "./table";

type Booking = {
  id: string;
  guest: string;
  status: "confirmed" | "pending" | "cancelled";
  amount: string;
};

const bookings: Booking[] = [
  { id: "b-1", guest: "Ana Ribeiro", status: "confirmed", amount: "€1,240" },
  { id: "b-2", guest: "Marco Silva", status: "pending", amount: "€820" },
];

const richColumns: DataTableColumn<Booking>[] = [
  { key: "guest", header: "Guest" },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <StatusPill
        tone={
          row.status === "confirmed"
            ? "success"
            : row.status === "pending"
              ? "warning"
              : "danger"
        }
        label={row.status}
      />
    ),
  },
  { key: "amount", header: "Amount", align: "right" },
];

describe("DataTable legacy API", () => {
  it("renders legacy columns and rows unchanged", () => {
    render(
      <DataTable
        columns={["Trip", "Status"]}
        rows={[["Lisbon to Sintra", "Confirmed"]]}
      />
    );
    expect(screen.getByText("Trip")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Lisbon to Sintra")).toBeDefined();
    expect(screen.getByText("Confirmed")).toBeDefined();
  });
});

describe("DataTable rich API", () => {
  it("renders headers and cell values from row keys", () => {
    render(<DataTable<Booking> columns={richColumns} data={bookings} />);
    expect(screen.getByText("Guest")).toBeDefined();
    expect(screen.getByText("Ana Ribeiro")).toBeDefined();
    expect(screen.getByText("€820")).toBeDefined();
  });

  it("renders custom cell renderers for status pills", () => {
    const { container } = render(
      <DataTable<Booking> columns={richColumns} data={bookings} />
    );
    const pills = container.querySelectorAll("[data-tone]");
    expect(pills.length).toBe(2);
  });

  it("applies compact density class on outer wrapper", () => {
    const { container } = render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        density="compact"
      />
    );
    expect(container.firstChild).toHaveProperty("dataset");
    expect((container.firstChild as HTMLElement).dataset.density).toBe("compact");
  });

  it("defaults to comfortable density when not specified", () => {
    const { container } = render(
      <DataTable<Booking> columns={richColumns} data={bookings} />
    );
    expect((container.firstChild as HTMLElement).dataset.density).toBe(
      "comfortable"
    );
  });

  it("renders skeleton rows when loading", () => {
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={[]}
        isLoading
        loadingRowCount={4}
      />
    );
    const skeletons = screen.getAllByTestId("datatable-skeleton-row");
    expect(skeletons.length).toBe(4);
  });

  it("renders default empty state when data is empty", () => {
    render(<DataTable<Booking> columns={richColumns} data={[]} />);
    expect(screen.getByText("No records to display.")).toBeDefined();
  });

  it("renders custom empty state when provided", () => {
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={[]}
        emptyState={
          <div data-testid="custom-empty">No bookings this week</div>
        }
      />
    );
    expect(screen.getByTestId("custom-empty")).toBeDefined();
    expect(screen.getByText("No bookings this week")).toBeDefined();
  });

  it("renders row actions as accessible buttons and invokes onSelect", () => {
    const onArchive = vi.fn();
    const actions: DataTableRowAction<Booking>[] = [
      { id: "archive", label: "Archive", onSelect: onArchive },
    ];
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        rowActions={actions}
      />
    );
    const buttons = screen.getAllByRole("button", { name: "Archive" });
    expect(buttons.length).toBe(2);
    fireEvent.click(buttons[0]!);
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onArchive.mock.calls[0]![0]).toEqual(bookings[0]);
  });

  it("disables row action buttons when isDisabled returns true", () => {
    const actions: DataTableRowAction<Booking>[] = [
      {
        id: "cancel",
        label: "Cancel",
        onSelect: () => undefined,
        isDisabled: (row) => row.status === "cancelled",
      },
    ];
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={[
          ...bookings,
          { id: "b-3", guest: "Joana Costa", status: "cancelled", amount: "€0" },
        ]}
        rowActions={actions}
      />
    );
    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    expect(cancelButtons[0]!.hasAttribute("disabled")).toBe(false);
    expect(cancelButtons[2]!.hasAttribute("disabled")).toBe(true);
  });

  it("makes row action buttons keyboard focusable", () => {
    const actions: DataTableRowAction<Booking>[] = [
      { id: "view", label: "View", onSelect: () => undefined },
    ];
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        rowActions={actions}
      />
    );
    const button = screen.getAllByRole("button", { name: "View" })[0]!;
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("applies sticky header positioning when stickyHeader is true", () => {
    const { container } = render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        stickyHeader
        maxHeight="320px"
      />
    );
    const thead = container.querySelector("thead");
    expect(thead).not.toBeNull();
    expect(thead!.className).toContain("sticky");
    const scroller = container.querySelector(
      "[data-testid='datatable-scroller']"
    ) as HTMLElement | null;
    expect(scroller).not.toBeNull();
    expect(scroller!.style.maxHeight).toBe("320px");
  });

  it("does not apply sticky header by default", () => {
    const { container } = render(
      <DataTable<Booking> columns={richColumns} data={bookings} />
    );
    const thead = container.querySelector("thead");
    expect(thead!.className.includes("sticky")).toBe(false);
  });

  it("wraps the table in a horizontal overflow container", () => {
    const { container } = render(
      <DataTable<Booking> columns={richColumns} data={bookings} />
    );
    const scroller = container.querySelector(
      "[data-testid='datatable-scroller']"
    ) as HTMLElement | null;
    expect(scroller).not.toBeNull();
    expect(scroller!.className).toContain("overflow-x-auto");
  });

  it("renders right-aligned header for an aligned column", () => {
    const { container } = render(
      <DataTable<Booking> columns={richColumns} data={bookings} />
    );
    const headers = container.querySelectorAll("thead th");
    const amountHeader = Array.from(headers).find(
      (th) => th.textContent === "Amount"
    );
    expect(amountHeader).toBeDefined();
    expect((amountHeader as HTMLElement).className).toContain("text-right");
  });

  it("uses getRowId for stable row keys", () => {
    const { container } = render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        getRowId={(row) => row.id}
      />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
    const firstRow = rows[0]!;
    const within0 = within(firstRow as HTMLElement);
    expect(within0.getByText("Ana Ribeiro")).toBeDefined();
  });

  it("attaches aria-label to the table when provided", () => {
    render(
      <DataTable<Booking>
        columns={richColumns}
        data={bookings}
        ariaLabel="Recent bookings"
      />
    );
    expect(screen.getByRole("table", { name: "Recent bookings" })).toBeDefined();
  });
});

describe("StatusPill", () => {
  it("renders label", () => {
    render(<StatusPill label="Pending" tone="warning" />);
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("exposes data-tone attribute for styling and tests", () => {
    const { container } = render(
      <StatusPill label="Confirmed" tone="success" />
    );
    expect((container.firstChild as HTMLElement).dataset.tone).toBe("success");
  });

  it("defaults to neutral tone when none specified", () => {
    const { container } = render(<StatusPill label="Idle" />);
    expect((container.firstChild as HTMLElement).dataset.tone).toBe("neutral");
  });
});
