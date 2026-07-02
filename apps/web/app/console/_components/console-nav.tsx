import Link from "next/link";

/**
 * ConsoleNav — shared side nav for /console/* routes.
 *
 * Source: docs/prototype.html (ConsoleNav component, lines 164-181).
 * Olive-dark sidebar with: Rumia Console wordmark, 6 nav items.
 */
export function ConsoleNav() {
  return (
    <nav className="hidden md:flex flex-col h-full py-section-gap px-gutter z-50 fixed left-0 top-0 w-64 bg-olive-dark shadow-2xl backdrop-blur-xl">
      <div className="mb-8 px-3">
        <Link href="/" className="font-headline-sm text-headline-sm text-ochre-light block">
          Rumia Console
        </Link>
        <p className="font-mono-micro text-mono-micro text-linen-dark opacity-70 mt-1 uppercase">
          Management Portal
        </p>
      </div>
      <ul className="flex-1 space-y-2">
        <li>
          <Link
            href="/console/pipeline"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">assignment_turned_in</span> Pipeline
          </Link>
        </li>
        <li>
          <Link
            href="/console/workspace"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">edit_note</span> Revision Workspace
          </Link>
        </li>
        <li>
          <Link
            href="/console/messages"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">chat_bubble</span> Messaging Hub
          </Link>
        </li>
        <li>
          <Link
            href="/console/graph"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">account_tree</span> Knowledge Graph
          </Link>
        </li>
        <li>
          <Link
            href="/console/metrics"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">analytics</span> Metrics
          </Link>
        </li>
        <li>
          <Link
            href="/console/config"
            className="text-on-primary-container/70 p-3 flex items-center gap-3 hover:bg-primary-container/50 hover:text-linen-dark rounded-lg font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">settings</span> System Config
          </Link>
        </li>
      </ul>
    </nav>
  );
}