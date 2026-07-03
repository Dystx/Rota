"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { ConsoleNav } from "../_components/console-nav";
import { SiteFooter } from "../../_components/site-footer";
import { SnippetCard } from "../_components/snippet-card";

interface Conversation {
  id: string;
  name: string;
  region: string;
  lastMessage: string;
  timestamp: string;
  active: boolean;
  avatarSrc: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "eleanor",
    name: "Eleanor Vance",
    region: "Kyoto, Japan",
    lastMessage: "I’d love to add that tea ceremony to the itinerary.",
    timestamp: "10:42 AM",
    active: true,
    avatarSrc: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: "hastings",
    name: "The Hasting Family",
    region: "Tuscany, Italy",
    lastMessage: "Could you confirm the car transfer?",
    timestamp: "Yesterday",
    active: false,
    avatarSrc: "https://i.pravatar.cc/40?img=11",
  },
];

export default function ConsoleMessagesPage() {
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0]!.id);
  const [draft, setDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const activeConversation =
    CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0]!;

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const data = event.dataTransfer.getData("text/plain");
    if (data) {
      setDraft((current) =>
        current ? `${current}\n${data}` : data
      );
    }
  };

  return (
    <>
      <ConsoleNav />
      <div className="min-h-screen flex flex-col bg-background relative">
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-cover bg-center opacity-40 blur-sm pointer-events-none"
          style={{
            backgroundImage:
              "url(https://picsum.photos/seed/kyoto-interior/1920/1080)",
          }}
        />
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-glass-light/30 pointer-events-none"
        />

        <main id="main-content" className="relative z-10 flex-1 md:ml-64 h-screen flex gap-gutter p-container-padding-sm overflow-hidden">
          {/* Column 1: Conversations */}
          <aside className="w-[320px] flex-shrink-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
            <header className="p-4 border-b border-olive-light/10 flex items-center justify-between shrink-0">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Active Threads
              </h2>
              <button
                type="button"
                aria-label="Filter conversations"
                className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <span aria-hidden className="material-symbols-outlined">
                  filter_list
                </span>
              </button>
            </header>
            <div className="p-3 border-b border-olive-light/10 bg-surface-container-lowest/50">
              <label className="relative block">
                <span className="sr-only">Search conversations</span>
                <span
                  aria-hidden
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                >
                  search
                </span>
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full font-body-md text-body-md pl-10 pr-4 py-2 rounded-lg bg-white/60 border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
                />
              </label>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {CONVERSATIONS.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    aria-pressed={conversation.active}
                    className={`w-full text-left p-4 border-b border-olive-light/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1 ${
                      conversation.active
                        ? "bg-surface-container border-l-4 border-ochre-light"
                        : "hover:bg-white/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="relative shrink-0">
                        <img
                          src={conversation.avatarSrc}
                          alt={`${conversation.name} avatar`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {conversation.active ? (
                          <span
                            aria-hidden
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-olive-light border-2 border-surface-container"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-headline-sm text-headline-sm text-primary truncate">
                            {conversation.name}
                          </h3>
                          <span className="font-mono-technical text-mono-technical text-on-surface-variant shrink-0">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <span className="inline-block font-mono-micro text-mono-micro uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded mt-0.5">
                          {conversation.region}
                        </span>
                        <p className="font-body-md text-body-md text-on-surface-variant truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Column 2: Chat Terminal */}
          <section className="flex-1 min-w-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
            <header className="px-6 py-4 border-b border-olive-light/10 bg-white/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activeConversation.avatarSrc.replace("40", "48")}
                  alt={`${activeConversation.name} avatar`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    {activeConversation.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      aria-hidden
                      className="w-2 h-2 rounded-full bg-olive-light"
                    />
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Online
                    </span>
                    <span className="font-mono-technical text-mono-technical text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                      Status: Planning
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Open client profile"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span aria-hidden className="material-symbols-outlined">
                    person
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Open itinerary map"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span aria-hidden className="material-symbols-outlined">
                    map
                  </span>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex justify-center">
                <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest/60 px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[70%] bg-primary-container text-on-primary-container rounded-2xl rounded-tr-sm p-4 shadow-sm">
                  <p className="font-body-md text-body-md">
                    Good morning, Eleanor. I&apos;ve been looking into the
                    accommodations for your time in Kyoto. The ryokan in
                    Higashiyama has confirmed availability for your dates.
                  </p>
                  <span className="block font-mono-micro text-mono-micro uppercase tracking-wider opacity-70 mt-2">
                    10:15 AM
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <img
                  src={activeConversation.avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="max-w-[70%] bg-surface text-on-surface rounded-2xl rounded-tl-sm p-4 border border-olive-light/10 shadow-sm">
                  <p className="font-body-md text-body-md">
                    That sounds wonderful! I was also reading about a
                    traditional tea ceremony experience. Is there one you
                    recommend nearby?
                  </p>
                  <span className="block font-mono-micro text-mono-micro uppercase tracking-wider text-on-surface-variant mt-2">
                    10:30 AM
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <img
                  src={activeConversation.avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0 opacity-0"
                />
                <div className="max-w-[70%] bg-surface text-on-surface rounded-2xl rounded-tl-sm p-4 border border-olive-light/10 shadow-sm">
                  <p className="font-body-md text-body-md">
                    I&apos;d love to add that tea ceremony to the itinerary if
                    possible.
                  </p>
                  <span className="block font-mono-micro text-mono-micro uppercase tracking-wider text-on-surface-variant mt-2">
                    10:42 AM
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <img
                  src={activeConversation.avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="bg-surface border border-olive-light/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span
                    aria-hidden
                    className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    aria-hidden
                    className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    aria-hidden
                    className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/60 backdrop-blur-md border-t border-olive-light/10 shrink-0">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl border bg-white focus-within:border-ochre-light transition-colors ${
                  dragOver
                    ? "border-ochre-light ring-2 ring-ochre-light/40"
                    : "border-outline-variant"
                }`}
              >
                <label className="block">
                  <span className="sr-only">Type a message</span>
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setDraft(event.target.value)
                    }
                    placeholder="Type a message or drag a snippet here…"
                    className="w-full font-body-md text-body-md bg-transparent text-primary placeholder:text-on-surface-variant p-3 resize-none focus:outline-none"
                  />
                </label>
                <div className="flex items-center justify-between px-3 py-2 border-t border-outline-variant/40">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Attach file"
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        attach_file
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="AI assistance"
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        auto_awesome
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Send message"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-ui text-label-ui px-4 py-2 rounded-lg hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                  >
                    <span aria-hidden className="material-symbols-outlined text-[18px]">
                      send
                    </span>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3: Tools & Context */}
          <aside className="w-[340px] flex-shrink-0 flex flex-col gap-gutter">
            <section className="flex-1 min-h-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
              <header className="px-4 py-3 border-b border-olive-light/10 bg-white/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="material-symbols-outlined text-ochre-dark"
                  >
                    library_books
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Snippet Library
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Add new snippet"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span aria-hidden className="material-symbols-outlined">
                    add_circle
                  </span>
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-gutter">
                <div>
                  <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant mb-2">
                    Kyoto Recommendations
                  </h4>
                  <div className="flex flex-col gap-2">
                    <SnippetCard
                      title="Camellia Tea Ceremony"
                      body="A 90-minute intimate tea ceremony hosted in a 100-year-old machiya in Gion. Includes wagashi tasting and quiet reflection time."
                    />
                    <SnippetCard
                      title="Arashiyama Early Morning"
                      body="Pre-dawn departure to avoid crowds. Includes private prayer at the bamboo grove before opening hours."
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant mb-2">
                    General Admin
                  </h4>
                  <div className="flex flex-col gap-2">
                    <SnippetCard
                      title="Deposit Reminder"
                      body="Friendly nudge that the second 50% deposit is due 60 days before departure, with a direct payment link."
                    />
                  </div>
                </div>
              </div>
              <footer className="p-3 bg-surface-container-lowest/50 border-t border-olive-light/10 shrink-0">
                <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant text-center">
                  Drag snippets to chat
                </p>
              </footer>
            </section>

            <section className="flex-1 min-h-0 flex flex-col bg-glass-dark text-on-primary backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10">
              <header className="px-4 py-3 border-b border-white/10 bg-black/20 flex items-center gap-2 shrink-0">
                <span
                  aria-hidden
                  className="material-symbols-outlined text-ochre-light"
                >
                  timeline
                </span>
                <h3 className="font-headline-sm text-headline-sm text-ochre-light">
                  Update Timeline
                </h3>
              </header>
              <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                <p className="font-body-md text-body-md text-on-primary/80">
                  Push a new event onto {activeConversation.name}&apos;s
                  itinerary. The change is logged and visible in the
                  workspace.
                </p>
                <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                  <label className="block">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                      Event Type
                    </span>
                    <select
                      defaultValue="activity"
                      className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                    >
                      <option value="activity" className="text-primary">
                        Activity / Tour
                      </option>
                      <option value="accommodation" className="text-primary">
                        Accommodation
                      </option>
                      <option value="transfer" className="text-primary">
                        Transfer
                      </option>
                      <option value="dining" className="text-primary">
                        Dining
                      </option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                      Title
                    </span>
                    <input
                      type="text"
                      defaultValue="Camellia Tea Ceremony"
                      className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                        Date
                      </span>
                      <input
                        type="date"
                        defaultValue="2024-10-14"
                        className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                        Time
                      </span>
                      <input
                        type="time"
                        defaultValue="14:00"
                        className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                      Internal Notes
                    </span>
                    <textarea
                      rows={2}
                      placeholder="For the team only…"
                      className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light resize-none"
                    />
                  </label>
                </form>
              </div>
              <footer className="p-4 bg-black/30 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 bg-ochre-dark text-white font-label-ui text-label-ui px-4 py-2.5 rounded-lg hover:bg-ochre-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark transition-colors"
                >
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    sync_alt
                  </span>
                  Push to Timeline
                </button>
              </footer>
            </section>
          </aside>
        </main>
        <SiteFooter />
      </div>
      <style>{`
        main ::-webkit-scrollbar { width: 6px; }
        main ::-webkit-scrollbar-thumb {
          background-color: rgba(60, 84, 71, 0.2); border-radius: 9999px;
        }
      `}</style>
    </>
  );
}