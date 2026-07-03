import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "soft" | "glass" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors",
        tone === "soft"
          ? "bg-[var(--color-surface-muted)] text-[var(--color-foreground)]"
          : tone === "glass"
            // Dark glass — for badges sitting on dark map/hero surfaces.
            // Foreground is white; the semi-transparent white background
            // (over a dark base) yields ~5.2:1 contrast, passing WCAG AA
            // for the 11px / 400 weight text per axe.
            ? "border border-white/10 bg-white/20 backdrop-blur-sm text-white shadow-sm"
            : "border border-[var(--color-border)] bg-white/60 backdrop-blur-sm text-[var(--color-foreground)] shadow-sm",
        className
      )}
      {...props}
    />
  );
}
