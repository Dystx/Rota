import type { ReactNode } from "react";

type DataTableProps = {
  columns: string[];
  rows: ReactNode[][];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--color-border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium uppercase tracking-[0.12em]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="border-t border-[var(--color-border)]">
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-4 text-[var(--color-foreground)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
