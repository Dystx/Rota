type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

function getDocument(): ViewTransitionDocument | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  return document as ViewTransitionDocument;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns whether view transitions can run without overriding a motion preference. */
export function supportsViewTransitions(): boolean {
  const browserDocument = getDocument();

  return (
    !prefersReducedMotion() &&
    typeof browserDocument?.startViewTransition === "function"
  );
}

/** Runs an update in a view transition when it is safe, otherwise immediately. */
export function runViewTransition(update: () => void): void {
  const browserDocument = getDocument();

  if (!supportsViewTransitions() || !browserDocument?.startViewTransition) {
    update();
    return;
  }

  browserDocument.startViewTransition(update);
}

/** Assigns an optional view-transition name to a shared element. */
export function setTransitionName(element: HTMLElement, name: string | null): void {
  element.style.viewTransitionName = name ?? "";
}
