import { ConsoleNav } from "../_components/console-nav";
import { SiteFooter } from "../../_components/site-footer";

export default function ConsoleMessagesPage() {
  return (
    <>
      <ConsoleNav />
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 md:ml-64 p-container-padding-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
            Messaging Hub
          </h2>
          <div className="bg-glass-light p-4 rounded-xl border border-white/20">
            Messages Interface
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}