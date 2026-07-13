import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

/**
 * Visual context the empty state lives in. Each variant maps to a
 * distinct container treatment so the same component can carry
 * "first-visit hero" (`default` / `cinematic` / `hero`), full-bleed
 * map overlay (`map`), table-row separator (`table`), compact card
 * (`compact`), and dashed form gap (`form`).
 */
type Variant =
  | "default"
  | "hero"
  | "cinematic"
  | "table"
  | "compact"
  | "form"
  | "map";

/**
 * Per-variant container classes. The base `flex flex-col
 * items-center justify-center text-center` is applied on top so
 * every variant lays children out the same way.
 */
const VARIANT_CONTAINER: Record<Variant, string> = {
  default: "min-h-[60vh] gap-6 px-6 py-16",
  hero: "min-h-[60vh] gap-6 px-6 py-16",
  cinematic: "min-h-[60vh] gap-6 px-6 py-16",
  table: "border-b border-olive-light/20 py-4",
  compact: "py-8 gap-3",
  form: "rounded-2xl border border-dashed border-olive-light/30 bg-white/30 p-8 gap-3",
  map: "absolute inset-0 gap-4",
};

/**
 * Variants that use the large icon + display title. `map` is
 * included because it's a full-bleed overlay — the larger mark
 * reads better across the whole viewport.
 */
const HERO_VARIANTS: ReadonlySet<Variant> = new Set([
  "default",
  "hero",
  "cinematic",
  "map",
]);

interface EmptyStateProps {
  /** Either a shared icon name (e.g. "explore", "map", "inbox") or a
   *  custom ReactNode (for callers that want to pass their own SVG/markup).
   *  Strings go through the shared SVG Icon component; nodes are rendered as-is
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
  /**
   * @deprecated Use `variant` instead. Kept for backward-compat:
   * `size="hero"` maps to the `hero` variant; `size="default"`
   * falls through to the default cinematic look.
   */
  size?: "default" | "hero";
  /** Visual context — see `VARIANT_CONTAINER` above. */
  variant?: Variant;
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
  size,
  variant,
  className,
}: EmptyStateProps) {
  // Resolve the effective variant. Explicit `variant` wins; the
  // deprecated `size="hero"` is honoured so legacy callers still
  // get the hero treatment. Anything else falls through to the
  // default cinematic look (min-h-[60vh]).
  const resolved: Variant =
    variant ??
    (size === "hero" ? "hero" : "default");
  const isHero = HERO_VARIANTS.has(resolved);
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        VARIANT_CONTAINER[resolved],
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
          <Icon name={icon} className={isHero ? "text-[32px]" : "text-[24px]"} />
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
