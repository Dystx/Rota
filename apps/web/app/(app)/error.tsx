"use client";

import * as React from "react";
import { RouteRecovery } from "@/app/_components/route-recovery";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteRecovery kind="error" onRetry={reset} />;
}
