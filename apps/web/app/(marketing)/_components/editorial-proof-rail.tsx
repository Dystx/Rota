import * as React from "react";

/**
 * A compact evidence rail for long editorial pages.
 *
 * It gives the first viewport one useful, scannable proof block instead of
 * leaving the space below a headline to decorative emptiness. The rail is
 * deliberately content-only: it never replaces the page's primary action.
 */
export function EditorialProofRail({
  items,
  testId = "editorial-proof-rail"
}: {
  items: readonly { label: string; value: React.ReactNode }[];
  testId?: string;
}) {
  return (
    <dl
      data-testid={testId}
      className="grid gap-5 border-y border-[var(--color-border)] py-5 sm:grid-cols-3 sm:gap-6 md:py-6"
    >
      {items.map((item) => (
        <div key={item.label} className="grid gap-2">
          <dt className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            {item.label}
          </dt>
          <dd className="max-w-[24rem] text-sm leading-relaxed text-on-surface-variant">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
