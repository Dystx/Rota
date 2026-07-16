import * as React from "react";

import { Icon } from "@repo/ui";

/**
 * A deliberate closing beat for an editorial chapter.
 *
 * Public discovery pages can become visually quiet after a short result set.
 * This primitive gives that pause a job: restate the decision, show the next
 * move, and close the surface with the same dark judgement language used by
 * the intent composer and planner.
 */
export function EditorialChapterClose({
  kicker,
  title,
  description,
  children,
  ariaLabel,
  testId
}: {
  kicker: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  ariaLabel: string;
  testId?: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className="rumia-chapter-close"
      data-testid={testId}
    >
      <div aria-hidden className="rumia-chapter-close__mark">
        <Icon name="compass" weight="thin" />
      </div>
      <div className="rumia-chapter-close__body">
        <p className="rumia-chapter-close__kicker">{kicker}</p>
        <h2 className="rumia-chapter-close__title">{title}</h2>
        <p className="rumia-chapter-close__description">{description}</p>
        {children ? <div className="rumia-chapter-close__content">{children}</div> : null}
      </div>
    </section>
  );
}
