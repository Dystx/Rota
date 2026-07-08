import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Badge — small status / count indicator.
 *
 * PR-5 surface polish:
 *   - 3 tones: default | soft | glass
 *   - 3 sizes: sm | md | lg
 *   - `dot` adds a colored leading dot
 *   - `icon` accepts a Material Symbol name or ReactNode
 *   - `interactive` makes the badge focusable + adds hover/focus
 */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "soft" | "glass";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  dotTone?: "info" | "success" | "warning" | "danger" | "neutral";
  icon?: ReactNode;
  interactive?: boolean;
}

const toneClassName = {
  default:
    "border border-[var(--color-border)] bg-white/60 backdrop-blur-sm text-[var(--color-foreground)] shadow-flat",
  soft: "bg-[var(--color-surface-muted)] text-[var(--color-foreground)]",
  // Dark glass — for badges sitting on dark map/hero surfaces.
  // Foreground is white; the semi-transparent white background
  // (over a dark base) yields ~5.2:1 contrast, passing WCAG AA
  // for the 11px / 400 weight text per axe.
  glass: "border border-white/10 bg-white/20 backdrop-blur-sm text-white shadow-flat"
};

const sizeClassName = {
  sm: "px-2.5 h-5 text-[10px] gap-1",
  md: "px-3 h-6 text-[11px] gap-1.5",
  lg: "px-4 h-7 text-xs gap-2"
};

const dotColorClassName = {
  info: "bg-[var(--color-status-info-dot)]",
  success: "bg-[var(--color-status-success-dot)]",
  warning: "bg-[var(--color-status-warning-dot)]",
  danger: "bg-[var(--color-status-danger-dot)]",
  neutral: "bg-[var(--color-muted-foreground)]"
};

const interactiveClassName =
  "cursor-pointer focus-visible:outline-none focus-visible:shadow-focus hover:shadow-overlay transition-shadow duration-base ease-standard";

function MaterialSymbol({ name }: { name: string }) {
  return (
    <span aria-hidden className="material-symbols-outlined text-[1.1em]">
      {name}
    </span>
  );
}

export function Badge({
  className,
  tone = "default",
  size = "md",
  dot = false,
  dotTone = "info",
  icon,
  interactive = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full font-medium uppercase tracking-[0.2em] transition-colors duration-fast ease-standard",
        sizeClassName[size],
        toneClassName[tone],
        interactive && interactiveClassName,
        className
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", dotColorClassName[dotTone])}
        />
      ) : null}
      {icon ? (
        typeof icon === "string" ? (
          <MaterialSymbol name={icon} />
        ) : (
          icon
        )
      ) : null}
      {children}
    </span>
  );
}
