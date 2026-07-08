"use client";

import { type ReactNode, useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";

/**
 * Modal — overlay dialog with focus trap.
 *
 * PR-5 surface polish:
 *   - Portal-rendered (escapes any parent stacking context)
 *   - Focus trap: Tab / Shift-Tab cycle through the modal's focusables
 *   - Esc closes; click on backdrop closes
 *   - Restores focus to the trigger element on close
 *   - aria-modal=true, role=dialog, aria-labelledby + aria-describedby
 *
 * No Radix dependency — implemented directly to keep the bundle
 * minimal. The contract is: caller provides isOpen + onClose; the
 * component handles the rest.
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  /** Optional footer (action buttons). */
  footer?: ReactNode;
  /** Class for the dialog panel. */
  className?: string;
}

const sizeClassName = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
} as const;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  className
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Save the trigger element on open so we can restore focus on close.
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Esc to close + focus trap.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Move focus to the first focusable child.
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();
    // Prevent body scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-dark/60 backdrop-blur-sm animate-in fade-in duration-base ease-standard"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative w-full rounded-xl bg-white shadow-overlay",
          "grid gap-4 p-6",
          "animate-in fade-in zoom-in-95 duration-base ease-emphasized",
          sizeClassName[size],
          className
        )}
      >
        <header className="grid gap-1">
          <h2 id={titleId} className="font-display text-title text-[var(--color-foreground)]">
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="text-body text-[var(--color-muted-foreground)]"
            >
              {description}
            </p>
          ) : null}
        </header>

        <div className="grid gap-3">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            {footer}
          </footer>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full text-[var(--color-muted-foreground)] hover:bg-olive-light/10 focus-visible:outline-none focus-visible:shadow-focus transition-colors duration-fast ease-standard"
        >
          <span aria-hidden className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
