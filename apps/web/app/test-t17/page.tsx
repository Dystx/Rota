"use client";

import {
  DataTable,
  StatCard,
  StatCardGrid,
  StatusPill,
  PageShell,
  SectionHeading,
  type DataTableColumn,
  type DataTableRowAction,
} from "@repo/ui";

type Booking = {
  id: string;
  guest: string;
  itinerary: string;
  nights: number;
  value: string;
  status: "confirmed" | "pending" | "review" | "cancelled";
};

const bookings: Booking[] = [
  { id: "RT-1042", guest: "Alves Family", itinerary: "Lisbon · Sintra · Évora", nights: 7, value: "€8,420", status: "confirmed" },
  { id: "RT-1043", guest: "Müller Party", itinerary: "Porto · Douro Valley", nights: 5, value: "€5,210", status: "pending" },
  { id: "RT-1044", guest: "Singh Honeymoon", itinerary: "Madeira Loop", nights: 9, value: "€12,300", status: "review" },
  { id: "RT-1045", guest: "Conti Solo", itinerary: "Algarve Coastal", nights: 4, value: "€3,150", status: "cancelled" },
  { id: "RT-1046", guest: "Okonkwo Group", itinerary: "Lisbon · Comporta", nights: 6, value: "€9,980", status: "confirmed" },
];

const statusToneMap = {
  confirmed: "success",
  pending: "warning",
  review: "info",
  cancelled: "danger",
} as const;

const columns: DataTableColumn<Booking>[] = [
  { key: "id", header: "Reference", cell: (row) => <span className="font-mono text-[12px]">{row.id}</span> },
  { key: "guest", header: "Guest", cell: (row) => row.guest },
  { key: "itinerary", header: "Itinerary", cell: (row) => row.itinerary },
  { key: "nights", header: "Nights", align: "right", cell: (row) => row.nights },
  { key: "value", header: "Value", align: "right", cell: (row) => row.value },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <StatusPill tone={statusToneMap[row.status]} label={row.status} />
    ),
  },
];

const rowActions: DataTableRowAction<Booking>[] = [
  { id: "view", label: "View", onSelect: () => undefined },
  { id: "export", label: "Export", onSelect: () => undefined, isDisabled: (row) => row.status === "cancelled" },
];

export default function TestT17Page() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="T17 Demo"
        title="DataTable v2 & StatCard"
        description="Static demonstration of operational tables, status pills, and stat cards."
        h1
      />

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Stat cards</h2>
        <StatCardGrid>
          <StatCard label="Active bookings" value="128" tone="info" helper="Last 30 days" trend={{ direction: "up", label: "+12%" }} />
          <StatCard label="Confirmed revenue" value="€482,300" tone="success" helper="MoM" trend={{ direction: "up", label: "+8.4%" }} />
          <StatCard label="Pending review" value="14" tone="warning" helper="Needs reviewer attention" trend={{ direction: "flat", label: "0%" }} />
          <StatCard label="Cancellations" value="3" tone="danger" helper="Past 7 days" trend={{ direction: "down", label: "-2" }} />
        </StatCardGrid>

        <StatCardGrid>
          <StatCard label="Loading" value="—" tone="neutral" isLoading />
          <StatCard label="Neutral" value="42" tone="neutral" helper="No trend" />
          <StatCard label="Icon" value="9" tone="info" icon={<span>★</span>} helper="With icon" />
          <StatCard label="Down trend" value="56" tone="info" trend={{ direction: "down", label: "-3.1%" }} />
        </StatCardGrid>
      </section>

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Populated table (sticky header, comfortable density)</h2>
        <DataTable<Booking>
          ariaLabel="Bookings"
          columns={columns}
          data={bookings}
          getRowId={(row) => row.id}
          rowActions={rowActions}
          stickyHeader
          maxHeight="320px"
          density="comfortable"
          caption="Recent bookings across all reviewers."
        />
      </section>

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Compact density</h2>
        <DataTable<Booking>
          ariaLabel="Bookings compact"
          columns={columns}
          data={bookings}
          getRowId={(row) => row.id}
          density="compact"
        />
      </section>

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Loading state</h2>
        <DataTable<Booking>
          ariaLabel="Bookings loading"
          columns={columns}
          data={[]}
          isLoading
          loadingRowCount={4}
        />
      </section>

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Empty state</h2>
        <DataTable<Booking>
          ariaLabel="Bookings empty"
          columns={columns}
          data={[]}
          emptyState={<span>No bookings match the current filters.</span>}
        />
      </section>

      <section className="grid gap-6 py-10">
        <h2 className="font-[family-name:var(--font-rota-display)] text-2xl">Status pill tones</h2>
        <div className="flex flex-wrap gap-3">
          <StatusPill tone="neutral" label="Neutral" />
          <StatusPill tone="info" label="Info" />
          <StatusPill tone="success" label="Success" />
          <StatusPill tone="warning" label="Warning" />
          <StatusPill tone="danger" label="Danger" />
        </div>
      </section>
    </PageShell>
  );
}
