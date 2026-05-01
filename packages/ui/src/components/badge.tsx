import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "soft" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors",
        tone === "soft"
          ? "bg-[var(--color-surface-muted)] text-[var(--color-foreground)]"
          : "border border-[var(--color-border)] bg-white/60 backdrop-blur-sm text-[var(--color-foreground)] shadow-sm",
        className
      )}
      {...props}
    />
  );
}
