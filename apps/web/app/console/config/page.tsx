import * as React from "react";
import { isFeatureEnabled } from "@repo/config";
import { DecisionStatePanel } from "@repo/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requirePageAccess, requirementForHttpRoute } from "@/lib/auth/page-access";
import { RouteRecovery } from "@/app/_components/route-recovery";

export default async function ConsoleConfigPage() {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "/console/config";
  const access = await requirePageAccess(
    requirementForHttpRoute(currentPath) ?? { anyRole: ["admin"], allCapabilities: ["configuration:deploy"] }
  );

  if (access.kind === "unavailable") return <RouteRecovery kind="unavailable" landmark="document" />;
  if (access.kind === "unauthenticated") redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  if (access.kind === "forbidden") {
    return (
      <main id="main-content" className="min-h-screen bg-linen px-6 py-16">
        <DecisionStatePanel
          kind="error"
          tone="light"
          headingLevel={1}
          title="Console configuration is restricted"
          description="This surface requires the configuration:deploy capability."
        />
      </main>
    );
  }

  if (!isFeatureEnabled("consoleConfig")) {
    return (
      <div data-testid="console-config" className="min-h-screen min-w-0 overflow-x-hidden bg-background p-container-padding-sm lg:p-container-padding-lg">
        <DecisionStatePanel
          kind="unavailable"
          headingLevel={1}
          title="Console configuration is disabled"
          description="ENABLE_CONSOLE_CONFIG is not enabled for this environment. No deployment controls are exposed."
        />
      </div>
    );
  }

  return (
    <div data-testid="console-config" className="min-h-screen min-w-0 overflow-x-hidden bg-background p-container-padding-sm lg:p-container-padding-lg">
      <header className="mb-6 border-b border-olive-light/15 pb-5">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">Operator configuration</p>
        <h1 className="mt-2 font-headline-lg text-headline-lg text-primary">System configuration</h1>
        <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Configuration is feature-gated and remains read-only until a persisted deployment store is connected.
        </p>
      </header>
      <DecisionStatePanel
        kind="unavailable"
        headingLevel={2}
        title="Configuration persistence is unavailable"
        description="The feature flag is enabled, but there is no confirmed persistence path. No values or deployment success are invented."
      />
    </div>
  );
}
