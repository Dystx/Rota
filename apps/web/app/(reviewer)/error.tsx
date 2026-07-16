"use client";

import * as React from "react";
import { RouteRecovery } from "@/app/_components/route-recovery";

export default function ReviewerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteRecovery kind="error" landmark="document" onRetry={reset} />;
}
