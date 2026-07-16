import { Fragment, cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type DecisionStateKind = "empty" | "loading" | "error" | "unavailable";
export type DecisionStateTone = "light" | "inverse";

export interface DecisionStatePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  kind: DecisionStateKind;
  tone?: DecisionStateTone;
  /** Descriptive alias for callers that name the panel surface directly. */
  surface?: DecisionStateTone;
  title?: string;
  description?: string;
  illustration?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

const DEFAULT_COPY: Record<DecisionStateKind, { title: string; description: string }> = {
  empty: {
    title: "Nothing chosen yet",
    description: "Start with one activity and shape the day from there."
  },
  loading: {
    title: "Shaping your day",
    description: "We are checking the route and its practical trade-offs."
  },
  error: {
    title: "The route needs another look",
    description: "We could not load this decision. Try again or continue with the list."
  },
  unavailable: {
    title: "This decision is not available yet",
    description: "The evidence is still being prepared. Check back soon or choose another activity."
  }
};

const KIND_ICON: Record<DecisionStateKind, string> = {
  empty: "○",
  loading: "…",
  error: "!",
  unavailable: "—"
};

function withTouchTarget(action: ReactNode): ReactNode {
  if (!isValidElement(action)) return action;
  // Fragments do not own a DOM target. Their rendered children are covered by
  // the action-row direct-child selectors below.
  if (action.type === Fragment) return action;

  const element = action as ReactElement<{ className?: string }>;
  // Native controls, Next links, and @repo/ui actions all accept className.
  // Cloning here keeps the sizing contract even when a route supplies one of
  // those design-system elements instead of a raw button.
  return cloneElement(element, { className: cn("min-h-11 min-w-11", element.props.className) });
}

/**
 * Shared empty/loading/error/unavailable language for decision surfaces.
 * Actions stay authored by the route, while the panel guarantees a stable
 * landmark and live-region semantics for assistive technology.
 */
export function DecisionStatePanel({
  kind,
  tone = "light",
  surface,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: DecisionStatePanelProps) {
  const resolvedTone = surface ?? tone;
  const copy = DEFAULT_COPY[kind];
  const role = kind === "error" ? "alert" : "status";

  return (
    <div
      data-testid="decision-state-panel"
      data-kind={kind}
      data-tone={resolvedTone}
      role={role}
      aria-live={kind === "error" ? "assertive" : "polite"}
      aria-busy={kind === "loading" ? true : undefined}
      className={cn(
        "rumia-decision-state-panel flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[var(--rumia-radius-dossier)] border px-6 py-10 text-center",
        resolvedTone === "inverse"
          ? "rumia-decision-state-panel--inverse border-white/20 bg-primary text-linen-dark"
          : "rumia-decision-state-panel--light border-olive-dark/12 bg-white/65 text-primary",
        className
      )}
      {...props}
    >
      <div
        data-testid="decision-state-panel-illustration"
        aria-hidden={illustration ? undefined : true}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border text-xl",
          resolvedTone === "inverse" ? "border-white/25 text-ochre-light" : "border-ochre-dark/25 text-ochre-on-light"
        )}
      >
        {illustration ?? KIND_ICON[kind]}
      </div>
      <div className="grid max-w-prose gap-2">
        <h2 className="font-display text-2xl leading-tight">{title ?? copy.title}</h2>
        <p className={cn("font-body text-base leading-relaxed", resolvedTone === "inverse" ? "text-linen-dark/75" : "text-on-surface-variant")}>
          {description ?? copy.description}
        </p>
      </div>
      {primaryAction || secondaryAction ? (
        <div className="flex min-h-11 min-w-11 flex-wrap items-center justify-center gap-3 [&>*]:min-h-11 [&>*]:min-w-11">
          {primaryAction ? withTouchTarget(primaryAction) : null}
          {secondaryAction ? withTouchTarget(secondaryAction) : null}
        </div>
      ) : null}
    </div>
  );
}
