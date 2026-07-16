import * as React from "react";
import type { HTMLAttributes, ReactNode } from "react";

/** The four editorial compositions shared by customer and product routes. */
export type RouteSceneTone = "cover" | "atlas" | "decision" | "utility";

/** Whether the scene owns the viewport edge or sits inside the page measure. */
export type RouteSceneBleed = "full" | "contained";
export type RouteSceneFocalLayer = "media" | "typography" | "illustration" | "data";

export interface RouteSceneProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  tone?: RouteSceneTone;
  bleed?: RouteSceneBleed;
  /** The single visual layer carrying this scene's primary attention. */
  focalLayer: RouteSceneFocalLayer;
  /** Primary copy and controls for the scene. Children are accepted as a shorthand. */
  foreground?: ReactNode;
  /** Authored image, video, map, or poster layer. */
  media?: ReactNode;
  /** Optional supporting rail (for example a chosen-day summary). */
  aside?: ReactNode;
  /** Optional task actions paired with the foreground. */
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * RouteScene is a structural composition primitive. It names the visual
 * grammar and gives authored slots stable landmarks, while leaving the actual
 * arrangement to the route. This keeps customer pages from collapsing into a
 * single fixed card template.
 */
export function RouteScene({
  tone = "decision",
  bleed = "contained",
  focalLayer,
  foreground,
  media,
  aside,
  actions,
  children,
  className,
  ...props
}: RouteSceneProps) {
  const resolvedForeground = foreground ?? children;

  return (
    <section
      data-testid="route-scene"
      data-tone={tone}
      data-bleed={bleed}
      data-focal-layer={focalLayer}
      className={[
        "rumia-route-scene relative isolate grid gap-6",
        `rumia-route-scene--${tone}`,
        `rumia-route-scene--${bleed}`,
        bleed === "full"
          ? "relative left-1/2 w-screen max-w-none -translate-x-1/2"
          : "mx-auto w-full max-w-wide",
        className
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {media ? (
        <div data-testid="route-scene-media" className="rumia-route-scene__media relative">
          {media}
        </div>
      ) : null}

      {resolvedForeground ? (
        <div data-testid="route-scene-foreground" className="rumia-route-scene__foreground relative z-10">
          {resolvedForeground}
        </div>
      ) : null}

      {aside ? (
        <aside data-testid="route-scene-aside" className="rumia-route-scene__aside relative z-10">
          {aside}
        </aside>
      ) : null}

      {actions ? (
        <div data-testid="route-scene-actions" className="rumia-route-scene__actions relative z-10 flex min-h-11 min-w-11 flex-wrap items-center gap-3 [&>*]:min-h-11 [&>*]:min-w-11">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
