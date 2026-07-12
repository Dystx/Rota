"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Icon } from "./icon";

/**
 * Lightweight toast system — a single global provider + a
 * `useToast()` hook for client components. Toast state lives in
 * a small event-emitter (no external store, no Context Provider
 * in the tree) so any component on any route can call
 * `toast.success("Saved")` without prop-drilling or refactoring
 * shared layout boundaries.
 *
 * Why not `sonner` / `react-hot-toast`? Both are great but pull
 * in a dep + ~5KB gzipped. The contract we need is "show a
 * pill in the bottom-right for 4s, then fade" — that's ~60
 * lines of code. Adding a dep for that is overkill.
 */

export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Duration in ms. Defaults to 4000. */
  duration?: number;
}

interface ToastState extends Required<Omit<ToastOptions, "description">> {
  id: string;
  description?: string;
}

type Listener = (toasts: ToastState[]) => void;

const listeners = new Set<Listener>();
let toasts: ToastState[] = [];
/**
 * Module-level empty array used as the SSR snapshot. React's
 * `useSyncExternalStore` requires `getServerSnapshot` to return
 * a STABLE reference — a fresh `[]` on each call triggers the
 * "result of getServerSnapshot should be cached to avoid an
 * infinite loop" warning and surfaces as a Next.js dev-tools
 * "1 Issue" badge on every page that imports this module.
 */
const EMPTY_TOASTS: ToastState[] = [];

function emit() {
  for (const l of listeners) l(toasts);
}

/** Push a new toast. Returns the toast id (use to dismiss early). */
export function toast(opts: ToastOptions): string {
  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const next: ToastState = {
    id,
    title: opts.title,
    description: opts.description,
    variant: opts.variant ?? "info",
    duration: opts.duration ?? 4000
  };
  toasts = [...toasts, next];
  emit();
  if (next.duration > 0) {
    setTimeout(() => dismissToast(id), next.duration);
  }
  return id;
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });
toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error", duration: 6000 });
toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" });

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): ToastState[] {
  return React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => EMPTY_TOASTS
  );
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-ink text-cream border-olive-light/30",
  error: "bg-red-600 text-white border-red-700",
  info: "bg-white text-ink border-olive-light/30"
};

const variantIcons: Record<ToastVariant, string> = {
  success: "check_circle",
  error: "error",
  info: "info"
};

/**
 * <ToastViewport /> — drop this once near the app root (the
 * root layout in apps/web/app/layout.tsx). It renders the live
 * toast queue as a stacked, bottom-right, dismissable pill list.
 * Renders nothing when the queue is empty.
 */
export interface ToastViewportProps {
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
}

const positionClassName: Record<Required<ToastViewportProps>["position"], string> = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4"
};

export function ToastViewport({ position = "bottom-right" }: ToastViewportProps = {}) {
  const items = useToasts();
  const reducedMotion = useReducedMotion();
  if (items.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className={cn(
        "fixed z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto",
        positionClassName[position]
      )}
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
            reducedMotion ? "transition-none" : "rumia-save-transition",
            variantStyles[t.variant]
          )}
        >
          <Icon name={variantIcons[t.variant]} className="mt-0.5 shrink-0 text-[20px]" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-snug">{t.title}</p>
            {t.description ? (
              <p className="text-xs opacity-80 mt-0.5">{t.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(t.id)}
            className="shrink-0 -mr-1 -mt-1 p-1 rounded opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ))}
    </div>
  );
}
