import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/** Semantic contexts used by the editorial surfaces. */
export type EditorialTone =
  | "linen"
  | "sage"
  | "midnight"
  | "ochre"
  | "default"
  | "inverse"
  | "light"
  | "dark";

const headingToneClassName: Record<EditorialTone, string> = {
  linen: "editorial-tone-linen text-midnight",
  sage: "editorial-tone-sage text-midnight",
  midnight: "editorial-tone-midnight text-linen",
  ochre: "editorial-tone-ochre text-midnight",
  default: "editorial-tone-linen text-midnight",
  inverse: "editorial-tone-midnight text-linen",
  light: "editorial-tone-linen text-midnight",
  dark: "editorial-tone-midnight text-linen"
};

const kickerToneClassName: Record<EditorialTone, string> = {
  linen: "editorial-tone-linen text-ochre",
  sage: "editorial-tone-sage text-ochre",
  midnight: "editorial-tone-midnight text-ochre-light",
  ochre: "editorial-tone-ochre text-ochre",
  default: "editorial-tone-linen text-ochre",
  inverse: "editorial-tone-midnight text-ochre-light",
  light: "editorial-tone-linen text-ochre",
  dark: "editorial-tone-midnight text-ochre-light"
};

export interface EditorialKickerProps {
  children: ReactNode;
  tone?: EditorialTone;
  className?: string;
}

/**
 * Short uppercase metadata that introduces an editorial section.
 *
 * Kicker content stays in the document flow and is intentionally rendered as
 * a paragraph so it can be read in the same order as the heading that follows.
 */
export function EditorialKicker({
  children,
  tone = "linen",
  className
}: EditorialKickerProps) {
  return (
    <p
      className={cn(
        "font-metadata text-metadata uppercase tracking-[0.16em]",
        kickerToneClassName[tone],
        className
      )}
    >
      {children}
    </p>
  );
}

export type EditorialHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface EditorialHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  dek?: ReactNode;
  as?: EditorialHeadingTag;
  tone?: EditorialTone;
  className?: string;
}

/**
 * The standard editorial reading grammar: eyebrow, display heading, then dek.
 * The `as` prop changes only the heading level; tone is expressed through
 * classes so the primitive remains presentational and composable.
 */
export function EditorialHeading({
  eyebrow,
  title,
  dek,
  as: Tag = "h1",
  tone = "linen",
  className
}: EditorialHeadingProps) {
  return (
    <header className={cn("grid gap-3", className)}>
      {eyebrow ? <EditorialKicker tone={tone}>{eyebrow}</EditorialKicker> : null}
      <Tag
        className={cn(
          "font-display text-display-mobile leading-tight tracking-[-0.02em] md:text-display",
          headingToneClassName[tone]
        )}
      >
        {title}
      </Tag>
      {dek ? (
        <p className="font-body text-body leading-relaxed text-on-surface-variant max-w-prose">
          {dek}
        </p>
      ) : null}
    </header>
  );
}

export interface EditorialRuleProps {
  className?: string;
}

/** A quiet separator used between editorial chapters and fact rails. */
export function EditorialRule({ className }: EditorialRuleProps) {
  return (
    <hr
      className={cn(
        "editorial-rule border-0 border-t border-midnight/20",
        className
      )}
    />
  );
}

export interface StatusRegionProps {
  children: ReactNode;
  politeness?: "off" | "polite" | "assertive";
  testId?: string;
}

/**
 * The authoritative announcement surface for save, remove, and recovery
 * feedback. It stays in the DOM even when its children are empty so updates
 * are announced consistently by assistive technology.
 */
export function StatusRegion({
  children,
  politeness = "polite",
  testId
}: StatusRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      data-testid={testId}
    >
      {children}
    </div>
  );
}
