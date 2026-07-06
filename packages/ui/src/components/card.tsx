import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-[var(--color-border)] bg-white/80 p-0 shadow-[0_8px_32px_rgba(24,28,28,0.04)] backdrop-blur-2xl transition-shadow hover:shadow-[0_16px_48px_rgba(24,28,28,0.06)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4 p-8 pb-4", className)} {...props} />;
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
        "font-display text-3xl tracking-tight text-[var(--color-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-base leading-relaxed text-[var(--color-muted-foreground)]", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-8 pt-0", className)} {...props} />;
}
