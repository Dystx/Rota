import Link from "next/link";
import { cn } from "../lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb — a11y-compliant trail of links to the current page.
 * Uses an ordered list + aria-label="Breadcrumb" so screen
 * readers announce the trail correctly. The last item is
 * `aria-current="page"` and renders as text (not a link) —
 * clicking the current page is a no-op and a visual anti-pattern.
 *
 * Used on deep pages (/trip/[id], /admin/places, /reviewer/queue)
 * to orient the user in the IA. Keep labels short — the full
 * page <h1> is right below.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className={cn("flex items-center gap-1.5", isLast && "min-w-0")}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-ink-soft hover:text-ink underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("text-ink font-medium", isLast && "truncate min-w-0")}
                  title={isLast ? item.label : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden className="text-ink-soft/50 select-none">/</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
