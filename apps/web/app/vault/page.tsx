import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Vault page — saved archive
 *
 * Source: docs/prototype.html (VaultPage component).
 */
export default function VaultPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md">
        <main className="flex-1 px-container-padding-sm max-w-7xl mx-auto w-full">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Saved Vault</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-glass-light p-4 rounded-xl border border-white/20 shadow-sm">
              <h2 className="font-headline-sm text-primary">Portugal Escape</h2>
              <p className="text-sm">7 DAYS</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}