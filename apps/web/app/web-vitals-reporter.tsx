"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import {
  resolveDefaultAnalyticsProvider,
  safeAnalyticsRoute,
  tryCapture,
  type WebVitalsMetricName,
  type WebVitalsRating
} from "@repo/analytics";

import { getDeviceCategory, getOrCreateAnonDistinctId } from "../lib/web-vitals";

type ReportableMetric = {
  name: string;
  value: number;
  id?: string;
  rating?: WebVitalsRating;
  navigationType?: string;
};

const SUPPORTED_METRICS: ReadonlySet<WebVitalsMetricName> = new Set([
  "LCP",
  "INP",
  "CLS",
  "TTFB",
  "FCP"
]);

function isSupportedMetric(name: string): name is WebVitalsMetricName {
  return SUPPORTED_METRICS.has(name as WebVitalsMetricName);
}

const NAVIGATION_TYPES = new Set([
  "navigate",
  "reload",
  "back-forward",
  "back-forward-cache",
  "prerender",
  "restore"
]);

function safeNavigationType(
  raw: string | undefined
): "navigate" | "reload" | "back-forward" | "back-forward-cache" | "prerender" | "restore" | undefined {
  if (!raw) return undefined;
  return NAVIGATION_TYPES.has(raw)
    ? (raw as "navigate" | "reload" | "back-forward" | "back-forward-cache" | "prerender" | "restore")
    : undefined;
}

export function WebVitalsReporter(): null {
  const pathname = usePathname();

  useReportWebVitals((metric: ReportableMetric) => {
    try {
      if (!isSupportedMetric(metric.name)) return;
      if (typeof metric.value !== "number" || !Number.isFinite(metric.value)) return;

      const provider = resolveDefaultAnalyticsProvider();
      const route = safeAnalyticsRoute(pathname ?? "/");
      const viewportWidth =
        typeof window !== "undefined" ? window.innerWidth : 1024;

      void tryCapture(provider, {
        name: "web_vitals_reported",
        distinctId: getOrCreateAnonDistinctId(),
        properties: {
          metric: metric.name,
          value: Math.round(metric.value * 1000) / 1000,
          route,
          device: getDeviceCategory(viewportWidth),
          ...(metric.rating ? { rating: metric.rating } : {}),
          ...(safeNavigationType(metric.navigationType)
            ? { navigation_type: safeNavigationType(metric.navigationType)! }
            : {})
        }
      });
    } catch {
      // Web Vitals reporting must never break the page. Swallow silently.
    }
  });

  return null;
}
