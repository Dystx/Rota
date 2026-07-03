import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type DataTableDensity = "compact" | "comfortable";

export type DataTableStatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type DataTableColumn<TRow> = {
  key: string;
  header: ReactNode;
  cell?: (row: TRow, rowIndex: number) => ReactNode;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableRowAction<TRow> = {
  id: string;
  label: string;
  onSelect: (row: TRow, rowIndex: number) => void;
  isDisabled?: (row: TRow) => boolean;
  icon?: ReactNode;
};

type LegacyDataTableProps = {
  columns: string[];
  rows: ReactNode[][];
};

type RichDataTableProps<TRow> = {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  getRowId?: (row: TRow, index: number) => string;
  rowActions?: DataTableRowAction<TRow>[];
  rowActionsLabel?: string;
  density?: DataTableDensity;
  stickyHeader?: boolean;
  maxHeight?: string;
  isLoading?: boolean;
  loadingRowCount?: number;
  loadingSlot?: ReactNode;
  emptyState?: ReactNode;
  caption?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export type DataTableProps<TRow = unknown> =
  | LegacyDataTableProps
  | RichDataTableProps<TRow>;

function isLegacyProps<TRow>(
  props: DataTableProps<TRow>
): props is LegacyDataTableProps {
  return (
    Array.isArray((props as LegacyDataTableProps).rows) &&
    !("data" in props) &&
    Array.isArray((props as LegacyDataTableProps).columns) &&
    ((props as LegacyDataTableProps).columns.length === 0 ||
      typeof (props as LegacyDataTableProps).columns[0] === "string")
  );
}

const densityCellClass: Record<DataTableDensity, string> = {
  compact: "px-3 py-2 text-[13px]",
  comfortable: "px-4 py-4 text-sm",
};

const densityHeaderClass: Record<DataTableDensity, string> = {
  compact: "px-3 py-2 text-[10px]",
  comfortable: "px-4 py-3 text-[11px]",
};

const alignClass: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const statusToneClass: Record<DataTableStatusTone, string> = {
  neutral:
    "border-[var(--color-status-neutral-border)] bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)]",
  info:
    "border-[var(--color-status-info-border)] bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
  success:
    "border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  warning:
    "border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  danger:
    "border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
};

const statusDotClass: Record<DataTableStatusTone, string> = {
  neutral: "bg-[var(--color-status-neutral-dot)]",
  info: "bg-[var(--color-status-info-dot)]",
  success: "bg-[var(--color-status-success-dot)]",
  warning: "bg-[var(--color-status-warning-dot)]",
  danger: "bg-[var(--color-status-danger-dot)]",
};

export type StatusPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: DataTableStatusTone;
  label: ReactNode;
};

export function StatusPill({
  tone = "neutral",
  label,
  className,
  ...rest
}: StatusPillProps) {
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        statusToneClass[tone],
        className
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", statusDotClass[tone])}
      />
      {label}
    </span>
  );
}

export function DataTable<TRow = unknown>(props: DataTableProps<TRow>) {
  if (isLegacyProps(props)) {
    return <LegacyDataTable {...props} />;
  }
  return <RichDataTable {...(props as RichDataTableProps<TRow>)} />;
}

function LegacyDataTable({ columns, rows }: LegacyDataTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--color-border)]">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Table — scrollable horizontally">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 font-medium uppercase tracking-[0.12em]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="border-t border-[var(--color-border)]"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-4 py-4 text-[var(--color-foreground)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RichDataTable<TRow>({
  columns,
  data,
  getRowId,
  rowActions,
  rowActionsLabel,
  density = "comfortable",
  stickyHeader = false,
  maxHeight,
  isLoading = false,
  loadingRowCount = 3,
  loadingSlot,
  emptyState,
  caption,
  className,
  ariaLabel,
}: RichDataTableProps<TRow>) {
  const totalColumns = columns.length + (rowActions && rowActions.length > 0 ? 1 : 0);
  const showEmpty = !isLoading && data.length === 0;

  return (
    <div
      data-density={density}
      className={cn(
        "overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-translucent-strong)] backdrop-blur-sm",
        className
      )}
    >
      <div
        data-testid="datatable-scroller"
        className={cn("overflow-x-auto", stickyHeader && "overflow-y-auto")}
        style={stickyHeader && maxHeight ? { maxHeight } : undefined}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel ? `${ariaLabel} — scrollable horizontally` : "Data table — scrollable horizontally"}
      >
        <table aria-label={ariaLabel} className="w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead
            className={cn(
              "bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]",
              stickyHeader && "sticky top-0 z-10"
            )}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "font-medium uppercase tracking-[0.12em]",
                    densityHeaderClass[density],
                    alignClass[column.align ?? "left"],
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions && rowActions.length > 0 ? (
                <th
                  scope="col"
                  className={cn(
                    "font-medium uppercase tracking-[0.12em] text-right",
                    densityHeaderClass[density]
                  )}
                >
                  {rowActionsLabel ? (
                    rowActionsLabel
                  ) : (
                    <span className="sr-only">Row actions</span>
                  )}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              loadingSlot ? (
                <tr>
                  <td colSpan={totalColumns} className="p-0">
                    {loadingSlot}
                  </td>
                </tr>
              ) : (
                Array.from({ length: Math.max(1, loadingRowCount) }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    data-testid="datatable-skeleton-row"
                    className="border-t border-[var(--color-border)]"
                  >
                    {columns.map((column) => (
                      <td
                        key={`skeleton-${index}-${column.key}`}
                        className={densityCellClass[density]}
                      >
                        <div className="h-3 w-2/3 animate-pulse rounded-md bg-[var(--color-skeleton)]" />
                      </td>
                    ))}
                    {rowActions && rowActions.length > 0 ? (
                      <td className={densityCellClass[density]}>
                        <div className="ml-auto h-3 w-12 animate-pulse rounded-md bg-[var(--color-skeleton)]" />
                      </td>
                    ) : null}
                  </tr>
                ))
              )
            ) : showEmpty ? (
              <tr>
                <td colSpan={totalColumns} className="p-0">
                  {emptyState ?? (
                    <div className="px-6 py-12 text-center text-sm text-[var(--color-muted-foreground)]">
                      No records to display.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowKey = getRowId ? getRowId(row, rowIndex) : `row-${rowIndex}`;
                return (
                  <tr
                    key={rowKey}
                    className="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-row-hover)]"
                  >
                    {columns.map((column) => {
                      const content = column.cell
                        ? column.cell(row, rowIndex)
                        : ((row as Record<string, ReactNode>)[column.key] as ReactNode);
                      return (
                        <td
                          key={`${rowKey}-${column.key}`}
                          className={cn(
                            "text-[var(--color-foreground)]",
                            densityCellClass[density],
                            alignClass[column.align ?? "left"],
                            column.cellClassName
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                    {rowActions && rowActions.length > 0 ? (
                      <td className={cn("text-right", densityCellClass[density])}>
                        <div className="flex justify-end gap-1.5">
                          {rowActions.map((action) => {
                            const disabled = action.isDisabled
                              ? action.isDisabled(row)
                              : false;
                            return (
                              <button
                                key={action.id}
                                type="button"
                                aria-label={action.label}
                                disabled={disabled}
                                onClick={() => action.onSelect(row, rowIndex)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-translucent)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-foreground)] transition-colors",
                                  "hover:border-[var(--color-accent)] hover:text-[var(--color-secondary)]",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
                                  "disabled:cursor-not-allowed disabled:opacity-50"
                                )}
                              >
                                {action.icon}
                                <span>{action.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
