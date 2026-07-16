"use client";

import * as React from "react";
import { RouteRecovery } from "./_components/route-recovery";

/** Root-document boundary. It is the only recovery surface that owns `<main>`. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-linen text-primary antialiased">
        <RouteRecovery kind="error" landmark="document" onRetry={reset} />
      </body>
    </html>
  );
}
