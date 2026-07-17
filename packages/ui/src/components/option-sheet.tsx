"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useRef, type JSX, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { Icon } from "./icon";

/**
 * Rumia's responsive choice sheet.
 *
 * Base UI owns focus containment, scroll locking, dismissal, portal mounting,
 * and return focus. Rumia owns the editorial surface, bottom-sheet geometry,
 * spacing, and motion so planner controls still feel like Rumia rather than a
 * generic component kit.
 */
export function OptionSheet(props: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}): JSX.Element {
  const onCloseRef = useRef(props.onClose);
  const openingElementRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);
  const openedThisRender = props.open && !wasOpenRef.current;

  // This component is intentionally controlled by planner state rather than
  // owning its own trigger. Capture the element that opened it at render time,
  // before Base UI moves focus into the portal, so focus can return there even
  // when the parent replaces its onClose callback while the sheet is open.
  if (openedThisRender && typeof document !== "undefined") {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      openingElementRef.current = activeElement;
    }
  }
  wasOpenRef.current = props.open;
  onCloseRef.current = props.onClose;

  useEffect(() => {
    if (!openedThisRender) return;

    const focusFirstControl = () => {
      const firstControl = popupRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button:not([aria-label="Close dialog"]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      firstControl?.focus();
    };

    focusFirstControl();
    queueMicrotask(focusFirstControl);
  }, [openedThisRender]);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          onCloseRef.current();
          // The root is controlled by the parent, so there is no colocated
          // Dialog.Trigger for Base UI to associate with this sheet. Restore
          // the opening control immediately after handing control back to
          // the parent, preserving keyboard continuity for every dismissal
          // path (close button, Escape, backdrop, and programmatic close).
          openingElementRef.current?.focus();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-olive-dark/55 backdrop-blur-sm",
            "data-[starting-style]:animate-in data-[starting-style]:fade-in",
            "data-[ending-style]:animate-out data-[ending-style]:fade-out",
            "motion-reduce:animate-none"
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-[60] flex items-end justify-center p-0 pointer-events-none sm:items-center sm:p-4">
          <Dialog.Popup
            ref={popupRef}
            initialFocus={false}
            finalFocus={false}
            className={cn(
              "pointer-events-auto relative grid max-h-[min(82dvh,42rem)] w-full max-w-xl gap-5 overflow-y-auto",
              "rounded-t-[28px] border border-olive-light/20 bg-linen-dark p-6 shadow-overlay",
              "sm:rounded-[28px] sm:p-8",
              "data-[starting-style]:animate-in data-[starting-style]:slide-in-from-bottom-3 data-[starting-style]:fade-in",
              "data-[ending-style]:animate-out data-[ending-style]:slide-out-to-bottom-3 data-[ending-style]:fade-out",
              "motion-reduce:animate-none"
            )}
          >
            <div
              aria-hidden="true"
              className="mx-auto h-1 w-12 rounded-full bg-olive-light/25 sm:hidden"
            />

            <header className="grid gap-2 pr-10">
              <Dialog.Title className="font-display text-2xl leading-tight text-primary sm:text-3xl">
                {props.title}
              </Dialog.Title>
              {props.description ? (
                <Dialog.Description className="text-base leading-7 text-on-surface-variant">
                  {props.description}
                </Dialog.Description>
              ) : null}
            </header>

            <div className="grid gap-3">{props.children}</div>

            <Dialog.Close
              type="button"
              aria-label="Close dialog"
              className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-olive-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 sm:right-5 sm:top-5"
            >
              <Icon aria-hidden name="x" className="h-5 w-5" />
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
