"use client";

import { RouteRecovery } from "./_components/route-recovery";

/** Root segment boundary. It owns the document `main` when no route shell can render. */
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteRecovery kind="error" landmark="document" onRetry={reset} />;
}
