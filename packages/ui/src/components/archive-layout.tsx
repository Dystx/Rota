import { Children, type ReactNode } from "react";
import { Badge } from "./badge";
import { PageShell, SectionHeading } from "./shell";
import { cn } from "../lib/cn";

export interface ArchiveLayoutProps {
  header: {
    eyebrow?: string;
    title: string;
    description?: string;
  };
  filters?: {
    label: string;
    active?: boolean;
    href?: string;
  }[];
  children: ReactNode;
  emptyState?: ReactNode;
  testid?: string;
  bare?: boolean;
}

export function ArchiveLayout({
  header,
  filters,
  children,
  emptyState,
  testid,
  bare = false,
}: ArchiveLayoutProps) {
  // Count truthy children to determine empty state
  const childrenArray = Children.toArray(children).filter(Boolean);
  const isListEmpty = childrenArray.length === 0;

  return (
    <PageShell data-testid={testid} bare={bare}>
      <div className="grid gap-8 lg:gap-12">
        <SectionHeading
          eyebrow={header.eyebrow || ""}
          title={header.title}
          description={header.description || ""}
          h1={true}
        />

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const badgeClasses = cn(
                "transition-all duration-300",
                filter.active && "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)]",
                filter.href && "cursor-pointer hover:bg-[var(--color-border)]"
              );

              const badge = (
                <Badge
                  tone={filter.active ? "default" : "soft"}
                  className={badgeClasses}
                >
                  {filter.label}
                </Badge>
              );

              if (filter.href) {
                return (
                  <a key={filter.label} href={filter.href} className="no-underline">
                    {badge}
                  </a>
                );
              }

              return <span key={filter.label}>{badge}</span>;
            })}
          </div>
        )}

        {isListEmpty && emptyState ? (
          emptyState
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {children}
          </div>
        )}
      </div>
    </PageShell>
  );
}
