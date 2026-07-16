"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ReactElement, ReactNode, RefObject } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

export interface NavigationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  trigger: ReactElement;
  children: ReactNode;
  /** Optional first destination to focus when the sheet opens. */
  initialFocus?: RefObject<HTMLElement | null>;
  closeLabel?: string;
  panelClassName?: string;
  backdropClassName?: string;
}

/**
 * Rumia-owned navigation wrapper around Base UI's unstyled Dialog.
 *
 * Base UI owns focus, dismissal, portal, and keyboard behavior. Rumia owns
 * the panel geometry, surface, motion, and all navigation content.
 */
export function NavigationSheet({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  initialFocus,
  closeLabel = "Close navigation",
  panelClassName,
  backdropClassName
}: NavigationSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-olive-dark/20 backdrop-blur-[2px]",
            "data-[starting-style]:animate-in data-[starting-style]:fade-in",
            "data-[ending-style]:animate-out data-[ending-style]:fade-out",
            "motion-reduce:animate-none",
            backdropClassName
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-[60] pointer-events-none">
            <Dialog.Popup
              initialFocus={initialFocus}
              className={cn(
              "pointer-events-auto fixed inset-x-0 top-[var(--spacing-header-height)]",
              "border-t border-olive-light/20 bg-linen-dark/95 backdrop-blur-md",
              "shadow-overlay outline-none",
              "data-[starting-style]:animate-in data-[starting-style]:slide-in-from-top-2 data-[starting-style]:fade-in",
              "data-[ending-style]:animate-out data-[ending-style]:slide-out-to-top-2 data-[ending-style]:fade-out",
              "motion-reduce:animate-none",
              panelClassName
            )}
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <div className="flex items-center justify-between border-b border-olive-light/15 px-container-padding-lg py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                Rumia navigation
              </p>
              <Dialog.Close
                type="button"
                aria-label={closeLabel}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <Icon aria-hidden name="x" className="h-5 w-5" />
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
