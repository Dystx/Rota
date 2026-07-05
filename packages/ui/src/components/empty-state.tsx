import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface EmptyStateProps {
  /** Either a Material Symbols icon name (e.g. "explore", "map",
   *  "inbox") or a custom ReactNode (for callers that want to
   *  pass their own SVG/markup). Strings go through the
   *  material-symbols-outlined font; nodes are rendered as-is
   *  inside the icon container. */
  icon?: string | ReactNode;
  /** Primary heading — kept short ("No itineraries yet"). */
  title: string;
  /** One sentence of supporting copy. */
  description?: string;
  /** Optional primary action (rendered as a styled button row). */
  action?: ReactNode;
  /** Optional secondary action next to the primary one. */
  secondaryAction?: ReactNode;
  /** Visual size — `default` for list pages, `hero` for empty
   *  first-visit states that need to fill the viewport. */
  size?: "default" | "hero";
  /**
   * Visual context the empty state lives in. `table` renders a
   * compact card inside a Card body (admin tables, reviewer
   * queue), `compact` is a small inline notice, `form` is a
   * 2-up layout beside a form, `map` is full-bleed for empty
   * map areas, `cinematic` is the large first-visit state.
   * `default` and `hero` map to the equivalent named `size`.
   */
  variant?: "default" | "hero" | "table" | "compact" | "form" | "map" | "cinematic";
  className?: string;
}

/**
 * EmptyState — the contract every data-driven page uses when its
 * list/fetch returns nothing. Centralises the icon + heading +
 * description + action pattern so the visual treatment is
 * consistent across /itineraries, /admin/places, /admin/regions,
 * /admin/quality, /reviewer/queue, etc.
 *
 * Why this matters: an empty list with no guidance is the
 * single biggest drop-off surface in a content app. Every empty
 * state should answer "what do I do now?" — that's what the
 * `action` slot is for.
 */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  size = "default",
  variant,
  className
}: EmptyStateProps) {
  // Backward-compat: `variant` predates `size`; map the legacy
  // names to the new size + container treatment.
  const resolvedSize: "default" | "hero" =
    size === "hero" || variant === "hero" || variant === "cinematic" || variant === "map"
      ? "hero"
      : "default";
  const containerClass =
    variant === "table" || variant === "compact" || variant === "form"
      ? "rounded-2xl border border-olive-light/20 bg-white/60 backdrop-blur-sm p-8 text-center"
      : undefined;
  const isHero = resolvedSize === "hero";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        containerClass,
        isHero
          ? "min-h-[60vh] gap-6 px-6 py-16"
          : "gap-3 px-4 py-12 rounded-2xl border border-dashed border-olive-light/30 bg-white/30",
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-full bg-olive-light/10 text-olive-light",
          isHero ? "w-16 h-16 mb-2" : "w-12 h-12"
        )}
      >
        {typeof icon === "string" ? (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: isHero ? 32 : 24 }}
          >
            {icon}
          </span>
        ) : (
          icon
        )}
      </div>
      <h2
        className={cn(
          "font-display text-ink",
          isHero ? "text-3xl md:text-4xl" : "text-xl"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-ink-soft max-w-md mx-auto",
            isHero ? "text-base" : "text-sm"
          )}
        >
          {description}
        </p>
      ) : null}
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
