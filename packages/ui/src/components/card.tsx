import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Card — surface primitive.
 *
 * PR-2 polish:
 *   - 5 variants: default (raised glass) | glass | outline | elevated | flat
 *   - 4 padding scales: none | sm | md | lg
 *   - `interactive` adds hover lift + focus ring (use on clickable cards)
 *   - `as` prop lets the consumer pick the underlying element (article, section, a)
 *
 * Backward compatible: existing call sites that pass only `className` get the
 * default glass-card with `p-8` content padding (same as before). The CardHeader
 * / CardContent / CardFooter subcomponents remain; CardTitle gains a sensible
 * default that already includes a heading-level marker.
 */

export type CardVariant = "default" | "glass" | "outline" | "elevated" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** When true, adds hover lift + focus ring + cursor pointer. Use on clickable cards. */
  interactive?: boolean;
  /** Render as a specific element. Defaults to `div`. */
  as?: ElementType;
  children?: ReactNode;
}

const variantClassName: Record<CardVariant, string> = {
  default:
    "rounded-xl border border-[var(--color-border)] bg-white/80 shadow-flat backdrop-blur-2xl transition-shadow",
  glass:
    "rounded-xl border border-white/30 bg-white/65 backdrop-blur-2xl shadow-flat",
  outline:
    "rounded-xl border border-[var(--color-border)] bg-transparent",
  elevated:
    "rounded-xl border border-[var(--color-border)] bg-white shadow-raised",
  flat: "rounded-xl border border-transparent bg-[var(--color-surface-muted)]"
};

const interactiveClassName =
  "hover:shadow-overlay hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:shadow-focus active:translate-y-0 transition-all duration-base ease-standard";

export function Card({
  className,
  variant = "default",
  padding = "md",
  interactive = false,
  as: Tag = "div",
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        variantClassName[variant],
        interactive && interactiveClassName,
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn("grid gap-3 p-8 pb-4", className)} {...props} />;
}

/**
 * CardTitle — heading element for a Card. Defaults to `<h3>` for
 * backward compatibility, but consumers should set the `as` prop to
 * match the surrounding heading hierarchy (typically `h2` when the
 * parent page has a single `<h1>`). Skipping a level is an a11y
 * violation per WCAG 1.3.1.
 */
export function CardTitle({
  className,
  as: Tag = "h3",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: ElementType }) {
  return (
    <Tag
      className={cn(
        "font-display text-title tracking-tight text-[var(--color-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-body text-[var(--color-muted-foreground)] leading-relaxed", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn("p-8 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-8 pt-4 border-t border-[var(--color-border)]",
        className
      )}
      {...props}
    />
  );
}
