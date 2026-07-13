"use client";

/**
 * PrintAutoTrigger — auto-fires window.print() once on mount.
 *
 * Used by the trip export page's `?view=print&print=1` mode. The
 * page renders a print-friendly itinerary; this island opens the
 * browser's print dialog so the user can save the page as a PDF
 * with a single click. The auto-fire is gated behind `?print=1` so
 * simply landing on the print view (via deep link or export flow)
 * doesn't open the dialog unexpectedly.
 *
 * The "Print now" button is a manual fallback — if the user closes
 * the dialog without printing, or if the auto-fire is blocked by
 * the browser, they can re-open it.
 */

import * as React from "react";
import { Icon } from "@repo/ui";

export function PrintAutoTrigger({ auto }: { auto: boolean }) {
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!auto) return;
    if (firedRef.current) return;
    firedRef.current = true;
    // Wait one frame so the print stylesheet has a chance to apply
    // (some browsers honour window.print() before paint).
    const id = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(id);
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-testid="print-now-button"
      className="inline-flex items-center gap-2 bg-olive-dark text-on-primary font-label-ui text-label-ui px-5 py-2.5 rounded-full hover:bg-olive-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
    >
      <Icon name="print" className="text-[18px]" />
      Print now
    </button>
  );
}
