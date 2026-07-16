"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useRef, type ComponentProps, type JSX, type ReactNode } from "react";

import { cn } from "../lib/cn";

/**
 * Rumia's right-side sheet for dense utility flows such as export and share.
 *
 * Base UI owns the dialog portal, inert background, focus containment, scroll
 * locking, and Escape/backdrop dismissal. The wrapper owns the editorial
 * surface and the controlled-trigger handoff because these flows are opened
 * from parent state rather than a colocated Dialog.Trigger.
 */
export function SideSheet(props: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  panelTestId?: string;
  backdropTestId?: string;
}): JSX.Element {
  const openingElementRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const openedThisRender = props.open && !wasOpenRef.current;
  const popupRef = useRef<HTMLDivElement | null>(null);

  if (openedThisRender && typeof document !== "undefined") {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      openingElementRef.current = activeElement;
    }
  }
  wasOpenRef.current = props.open;

  useEffect(() => {
    if (!openedThisRender) return;

    const focusFirstControl = () => {
      const firstControl = popupRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
          props.onClose();
          openingElementRef.current?.focus();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          data-testid={props.backdropTestId}
          className={cn(
            "fixed inset-0 z-50 bg-olive-dark/55 backdrop-blur-sm",
            "data-[starting-style]:animate-in data-[starting-style]:fade-in",
            "data-[ending-style]:animate-out data-[ending-style]:fade-out",
            "motion-reduce:animate-none"
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
          <Dialog.Popup
            ref={popupRef}
            data-testid={props.panelTestId}
            initialFocus={false}
            finalFocus={false}
            className={cn(
              "pointer-events-auto relative flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden",
              "border-l border-olive-light/30 bg-linen shadow-overlay",
              "data-[starting-style]:animate-in data-[starting-style]:slide-in-from-right-4 data-[starting-style]:fade-in",
              "data-[ending-style]:animate-out data-[ending-style]:slide-out-to-right-4 data-[ending-style]:fade-out",
              "motion-reduce:animate-none",
              props.panelClassName
            )}
          >
            <Dialog.Title className="sr-only">{props.title}</Dialog.Title>
            {props.description ? (
              <Dialog.Description className="sr-only">{props.description}</Dialog.Description>
            ) : null}
            {props.children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SideSheetClose(props: ComponentProps<typeof Dialog.Close>): JSX.Element {
  return <Dialog.Close {...props} />;
}
