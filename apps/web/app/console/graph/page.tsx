"use client";

import { useState } from "react";
import { ConsoleNav } from "../_components/console-nav";
import { SiteFooter } from "../../_components/site-footer";

interface TreeNode {
  id: string;
  label: string;
  icon: string;
  count?: string;
  children?: TreeNode[];
}

const HIERARCHY: TreeNode[] = [
  {
    id: "asia",
    label: "Asia",
    icon: "public",
    count: "4,291",
    children: [
      {
        id: "japan",
        label: "Japan",
        icon: "map",
        count: "842",
        children: [
          { id: "tokyo", label: "Tokyo", icon: "location_city" },
          { id: "kyoto", label: "Kyoto", icon: "location_city" },
          { id: "hokkaido", label: "Hokkaido", icon: "terrain" },
        ],
      },
    ],
  },
];

const VECTOR_PREVIEW = Array.from({ length: 36 }, (_, index) => {
  const seed = Math.sin(index * 1.7) * 0.5;
  return (seed + Math.cos(index * 0.9) * 0.3).toFixed(4);
}).join(", ");

export default function ConsoleGraphPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    asia: true,
    japan: true,
  });

  const toggle = (id: string) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));

  const renderNode = (node: TreeNode, depth: number) => {
    const isExpanded = !!expanded[node.id];
    const hasChildren = !!node.children?.length;
    const indent = depth > 0 ? `pl-${Math.min(depth, 12)}` : "";

    return (
      <li key={node.id} className={indent}>
        <button
          type="button"
          onClick={() => hasChildren && toggle(node.id)}
          aria-expanded={hasChildren ? isExpanded : undefined}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left font-mono-technical text-mono-technical hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light ${
            node.id === "japan"
              ? "bg-primary-container/30 border border-ochre-light/20 text-ochre-light font-medium"
              : "text-linen-dark"
          }`}
        >
          <span aria-hidden className="material-symbols-outlined text-[18px]">
            {hasChildren ? (isExpanded ? "expand_more" : "chevron_right") : node.icon}
          </span>
          <span aria-hidden className="material-symbols-outlined text-[18px] text-ochre-light">
            {hasChildren ? node.icon : ""}
          </span>
          <span className="flex-1 truncate">{node.label}</span>
          {node.count ? (
            <span className="font-mono-technical text-mono-technical opacity-70">
              {node.count}
            </span>
          ) : null}
        </button>
        {hasChildren && isExpanded ? (
          <ul className={`mt-1 space-y-1 ${depth >= 1 ? "pl-6" : "pl-6"}`}>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <>
      <ConsoleNav />
      <div className="min-h-screen flex flex-col bg-[#050806] text-linen-dark relative z-10 md:ml-64">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-container-padding-lg shrink-0 bg-black/40 backdrop-blur-md">
          <nav
            aria-label="Graph hierarchy path"
            className="flex items-center gap-2 font-mono-technical text-mono-technical text-linen-dark/70"
          >
            <span>Nodes</span>
            <span aria-hidden>/</span>
            <span>Geography</span>
            <span aria-hidden>/</span>
            <span className="text-ochre-light font-medium">Japan</span>
          </nav>
          <label className="relative">
            <span className="sr-only">Search graph nodes</span>
            <span
              aria-hidden
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-linen-dark/50 pointer-events-none"
            >
              search
            </span>
            <input
              type="search"
              placeholder="Search nodes…"
              className="w-64 font-body-md text-body-md bg-black/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-linen-dark placeholder:text-linen-dark/50 focus:outline-none focus:border-ochre-light/50 focus:ring-1 focus:ring-ochre-light/50"
            />
          </label>
        </header>

        <main id="main-content" className="flex-1 flex overflow-hidden">
          <aside className="w-1/3 min-w-[300px] border-r border-white/5 bg-black/20 flex flex-col">
            <header className="p-gutter border-b border-white/5 flex items-center justify-between shrink-0">
              <h2 className="font-headline-sm text-headline-sm text-linen-dark uppercase tracking-wide">
                Graph Hierarchy
              </h2>
              <button
                type="button"
                aria-label="Filter tree"
                className="p-2 rounded-lg text-linen-dark/70 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-olive-dark"
              >
                <span aria-hidden className="material-symbols-outlined">
                  filter_list
                </span>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 font-mono-technical text-mono-technical">
              <ul className="space-y-1">{HIERARCHY.map((node) => renderNode(node, 0))}</ul>
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto p-container-padding-lg">
            <div className="max-w-4xl mx-auto space-y-section-gap">
              <article className="relative overflow-hidden bg-glass-dark border border-white/5 rounded-xl p-card-padding shadow-2xl backdrop-blur-xl">
                <span
                  aria-hidden
                  className="absolute top-0 right-0 w-64 h-64 bg-ochre-dark/10 blur-[80px] rounded-full pointer-events-none"
                />
                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest bg-olive-light/30 border border-olive-light text-linen-dark px-2 py-1 rounded">
                        Node: Country
                      </span>
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest bg-olive-light/40 border border-olive-light/60 text-linen-dark px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <span
                          aria-hidden
                          className="w-1.5 h-1.5 rounded-full bg-olive-light"
                        />
                        Active
                      </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-linen-dark mb-2">
                      Japan
                    </h1>
                    <p className="font-mono-technical text-mono-technical text-linen-dark/60">
                      ID: node_geog_jp_0991a
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label="Edit node"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark"
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="View revision history"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark"
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        history
                      </span>
                    </button>
                  </div>
                </div>
              </article>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <article className="bg-black/40 border border-white/5 rounded-lg p-card-padding">
                  <h3 className="font-headline-sm text-headline-sm text-linen-dark mb-3 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="material-symbols-outlined text-ochre-light"
                    >
                      data_array
                    </span>
                    Semantic Vector Map
                  </h3>
                  <div className="relative bg-black/60 rounded border border-white/5 p-3 mb-3 h-32 overflow-hidden">
                    <p className="font-mono-technical text-mono-technical text-ochre-light break-words">
                      [{VECTOR_PREVIEW}, …]
                    </p>
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
                    />
                  </div>
                  <footer className="flex items-center justify-between border-t border-white/5 pt-3 font-mono-technical text-mono-technical text-linen-dark/70">
                    <span>Dim: 1536</span>
                    <span>Model: text-embedding-3-large</span>
                  </footer>
                </article>

                <article className="bg-black/40 border border-white/5 rounded-lg p-card-padding flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-linen-dark mb-3 flex items-center gap-2">
                    <span aria-hidden className="material-symbols-outlined text-ochre-light">
                      satellite_alt
                    </span>
                    Spatial Data (PostGIS)
                  </h3>
                  <div className="flex-1 relative bg-black/60 rounded border border-white/5 overflow-hidden min-h-[120px]">
                    <img
                      src="https://picsum.photos/seed/japan-map/600/300"
                      alt="Satellite reference map for Japan"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent"
                    />
                    <span className="absolute bottom-3 left-3 font-mono-technical text-mono-technical text-ochre-light bg-black/50 border border-white/10 px-2 py-1 rounded">
                      POINT(138.2529 36.2048)
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
      <style>{`
        main ::-webkit-scrollbar { width: 6px; }
        main ::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1); border-radius: 9999px;
        }
      `}</style>
    </>
  );
}