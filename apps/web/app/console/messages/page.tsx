"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { SiteFooter } from "../../_components/site-footer";
import { SnippetCard } from "../_components/snippet-card";
import { ConversationList } from "./_components/conversation-list";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { triageInboundMessage } from "../_components/message-triage";
import type { TriageResult } from "@repo/ai";
import { CONVERSATIONS, formatChatTimestamp, type Conversation } from "./_lib/conversations";

export default function ConsoleMessagesPage() {
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0]!.id);
  const [draft, setDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
  // Conversation-list search query. The search input's `value` is
  // bound to this; the filtered list is derived in the render.
  const [search, setSearch] = useState("");
  // Track Realtime connection to chat_messages. Feature-flagged so
  // SSR / no-Supabase environments keep the hardcoded board.
  const [isLive, setIsLive] = useState(false);
  const [incomingCount, setIncomingCount] = useState(0);
  // Most recent triage classification surfaced in the header.
  // null = no inbound message since the page loaded.
  const [lastTriage, setLastTriage] = useState<TriageResult | null>(null);
  // Phase 3.1: "Push to Timeline" submission state.
  // null = idle; "submitting" while the POST is in flight; a
  // string = success message (e.g. "Recorded — id 0fa1…") or
  // an error message from the API.
  const [timelineStatus, setTimelineStatus] = useState<
    "idle" | "submitting" | { kind: "ok"; id: string } | { kind: "error"; message: string }
  >("idle");
  const [isTimelinePending, startTimelineTransition] = useTransition();
  // Phase 3.2: chat-composer submission state. Same shape as
  // timelineStatus. On success, draft is cleared so the next
  // message can be typed immediately.
  const [chatStatus, setChatStatus] = useState<
    "idle" | "submitting" | { kind: "ok"; id: string } | { kind: "error"; message: string }
  >("idle");
  const [isChatPending, startChatTransition] = useTransition();
  // Optimistic list of operator messages the user has just sent.
  // Real-time subscription will also pick up the row from the
  // server; this list is what we render above the composer
  // *immediately* after send so the UI feels responsive.
  const [sentMessages, setSentMessages] = useState<
    Array<{ id: string; body: string; createdAt: string }>
  >([]);
  // Loaded chat-message history for the active conversation.
  // Phase 7: read from /api/console/chat-messages on mount + when
  // activeId changes. Renders the operator's and traveler's
  // bubbles above the composer.
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      conversationId: string;
      authorRole: "operator" | "traveler";
      body: string;
      createdAt: string;
    }>
  >([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  // Phase 7.2: itinerary-event history for the active
  // conversation. Drives the "Recent pushes" section in the
  // right-side Update Timeline panel so the operator can see
  // what they've already pushed (and what other operators
  // have pushed from the same conversation).
  const [recentEvents, setRecentEvents] = useState<
    Array<{
      id: string;
      eventType: "activity" | "accommodation" | "transfer" | "dining";
      title: string;
      eventDate: string;
      eventTime: string;
      createdAt: string;
    }>
  >([]);
  const [recentEventsLoading, setRecentEventsLoading] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_REALTIME_MESSAGES !== "true") return;

    // Cancellation flag: the async triage callback awaits a server
    // action. If the user navigates away during the await, we must
    // not call setLastTriage on an unmounted component (React 18+
    // warning + leaked triage badge on the next page).
    let cancelled = false;

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("console-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          if (cancelled) return;
          setIncomingCount((n) => n + 1);
          // Push the new row into the message list so the thread
          // updates live (Phase 7.1). The insert is from a
          // different session — our own optimistic insert goes
          // through `sentMessages` and merges on the render side.
          const row = (payload.new ?? {}) as Record<string, unknown>;
          const id = typeof row.id === "string" ? row.id : null;
          const conversationId =
            typeof row.conversation_id === "string" ? row.conversation_id : null;
          const body = typeof row.body === "string" ? row.body : "";
          const authorRole =
            row.author_role === "operator" || row.author_role === "traveler"
              ? row.author_role
              : "traveler";
          const createdAt =
            typeof row.created_at === "string" ? row.created_at : new Date().toISOString();
          if (id && conversationId) {
            setMessages((current) => {
              if (current.some((m) => m.id === id)) return current;
              return [
                ...current,
                { id, conversationId, authorRole, body, createdAt }
              ];
            });
          }
          if (body) {
            try {
              const result = await triageInboundMessage({ message: body });
              if (cancelled) return;
              setLastTriage(result);
            } catch {
              // Triage is best-effort; never break the live channel.
            }
          }
        }
      )
      .subscribe((status) => {
        if (cancelled) return;
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  // Phase 7.1: load the chat-message history for the active
  // conversation. Triggers on `activeId` change so switching
  // conversations refetches. The Realtime subscription above
  // keeps the list in sync with new inserts from any session.
  useEffect(() => {
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError(null);
    void (async () => {
      try {
        const response = await fetch(
          `/api/console/chat-messages?conversationId=${encodeURIComponent(activeId)}`
        );
        const data = (await response.json()) as {
          ok?: boolean;
          messages?: Array<{
            id: string;
            conversationId: string;
            authorRole: "operator" | "traveler";
            body: string;
            createdAt: string;
          }>;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !data.ok) {
          setMessagesError(data.error ?? `HTTP ${response.status}`);
          setMessages([]);
          return;
        }
        setMessages(data.messages ?? []);
      } catch (error) {
        if (cancelled) return;
        setMessagesError(
          error instanceof Error ? error.message : "Network error"
        );
        setMessages([]);
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Phase 7.2: load the recent itinerary events for the active
  // conversation. The push form reuses this list by calling
  // `loadRecentEvents()` after a successful submit (no need to
  // switch conversations).
  const loadRecentEvents = useCallback(
    async (conversationId: string) => {
      setRecentEventsLoading(true);
      try {
        const response = await fetch(
          `/api/console/itinerary-events?conversationId=${encodeURIComponent(conversationId)}`
        );
        const data = (await response.json()) as {
          ok?: boolean;
          events?: Array<{
            id: string;
            eventType: "activity" | "accommodation" | "transfer" | "dining";
            title: string;
            eventDate: string;
            eventTime: string;
            createdAt: string;
          }>;
          error?: string;
        };
        if (!response.ok || !data.ok) {
          setRecentEvents([]);
          return;
        }
        setRecentEvents(data.events ?? []);
      } catch {
        setRecentEvents([]);
      } finally {
        setRecentEventsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadRecentEvents(activeId);
  }, [activeId, loadRecentEvents]);

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

  // Phase 7.1: merge the server-loaded messages with the
  // operator's optimistic inserts. `sentMessages` is keyed by
  // the row id returned from the API (so dedupe is by id);
  // `messages` is the canonical list. Anything in `sentMessages`
  // not yet in `messages` (race between fetch and the
  // optimistic insert) is appended.
  const visibleMessages = useMemo(() => {
    const knownIds = new Set(messages.map((m) => m.id));
    const optimistic = sentMessages
      .filter((m) => !knownIds.has(m.id))
      .map((m) => ({
        id: m.id,
        conversationId: activeId,
        authorRole: "operator" as const,
        body: m.body,
        createdAt: m.createdAt
      }));
    return [...messages, ...optimistic];
  }, [messages, sentMessages, activeId]);

  return (
    <>
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
          <h1 className="sr-only">Messaging Hub</h1>
          {/* Column 1: Conversations */}
          <ConversationList
            conversations={CONVERSATIONS}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              // Reset the "new since you looked" counter
              // when the operator opens a conversation.
              setIncomingCount(0);
            }}
            search={search}
            onSearchChange={setSearch}
            incomingCount={incomingCount}
          />

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
                    <span
                      data-realtime={isLive ? "live" : "fallback"}
                      className={`font-mono-technical text-mono-technical px-2 py-0.5 rounded ${
                        isLive
                          ? "bg-olive-light/20 text-olive-dark"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {isLive ? `Live · ${incomingCount} new` : "Offline"}
                    </span>
                    {lastTriage ? (
                      <span
                        data-testid="triage-badge"
                        data-tier={lastTriage.tier}
                        className={`font-mono-technical text-mono-technical px-2 py-0.5 rounded ${
                          lastTriage.tier === "emergency"
                            ? "bg-error-container text-error animate-pulse"
                            : lastTriage.tier === "logistical"
                              ? "bg-ochre-light/30 text-ochre-dark"
                              : "bg-surface-container-high text-on-surface-variant"
                        }`}
                        title={lastTriage.rationale}
                      >
                        Triage: {lastTriage.tier} ({Math.round(lastTriage.confidence * 100)}%)
                      </span>
                    ) : null}
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

            <div
              data-testid="chat-thread"
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
            >
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center" data-testid="chat-thread-loading">
                  <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest/60 px-3 py-1 rounded-full">
                    Loading…
                  </span>
                </div>
              ) : null}
              {messagesError && messages.length === 0 ? (
                <div
                  data-testid="chat-thread-error"
                  role="alert"
                  className="font-body-md text-body-md text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  {messagesError}
                </div>
              ) : null}
              {!messagesLoading && !messagesError && messages.length === 0 ? (
                <div
                  data-testid="chat-thread-empty"
                  className="flex flex-col items-center justify-center text-center py-12 gap-2"
                >
                  <span
                    aria-hidden
                    className="material-symbols-outlined text-4xl text-on-surface-variant"
                  >
                    forum
                  </span>
                  <p className="font-headline-sm text-headline-sm text-primary">
                    No messages yet
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                    Send the first message below to start the conversation with
                    {" "}
                    {activeConversation.name}.
                  </p>
                </div>
              ) : null}
              {visibleMessages.map((message) =>
                message.authorRole === "operator" ? (
                  <div
                    key={message.id}
                    data-testid="chat-message-operator"
                    className="flex justify-end"
                  >
                    <div className="max-w-[70%] bg-primary-container text-on-primary-container rounded-2xl rounded-tr-sm p-4 shadow-sm">
                      <p className="font-body-md text-body-md whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                      <span className="block font-mono-micro text-mono-micro uppercase tracking-wider opacity-70 mt-2">
                        {formatChatTimestamp(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={message.id}
                    data-testid="chat-message-traveler"
                    className="flex items-start gap-3"
                  >
                    <img
                      src={activeConversation.avatarSrc}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="max-w-[70%] bg-surface text-on-surface rounded-2xl rounded-tl-sm p-4 border border-olive-light/10 shadow-sm">
                      <p className="font-body-md text-body-md whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                      <span className="block font-mono-micro text-mono-micro uppercase tracking-wider text-on-surface-variant mt-2">
                        {formatChatTimestamp(message.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              )}
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
                <form
                  data-testid="chat-composer-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const trimmed = draft.trim();
                    if (!trimmed) {
                      setChatStatus({ kind: "error", message: "Message is empty." });
                      return;
                    }
                    setChatStatus("submitting");
                    const body = trimmed;
                    startChatTransition(async () => {
                      try {
                        const response = await fetch("/api/console/chat-messages", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            conversationId: activeConversation.id,
                            body,
                          }),
                        });
                        const data = (await response.json()) as {
                          ok?: boolean;
                          id?: string;
                          createdAt?: string;
                          error?: string;
                        };
                        if (!response.ok || !data.ok || !data.id || !data.createdAt) {
                          setChatStatus({
                            kind: "error",
                            message: data.error ?? `HTTP ${response.status}`,
                          });
                          return;
                        }
                        // Optimistic insert into the local list
                        // so the operator sees the message
                        // immediately. The Realtime channel
                        // will de-dupe if the same row comes
                        // back from the server.
                        setSentMessages((current) => {
                          if (current.some((m) => m.id === data.id)) return current;
                          return [
                            ...current,
                            { id: data.id!, body, createdAt: data.createdAt! },
                          ];
                        });
                        setDraft("");
                        setChatStatus({ kind: "ok", id: data.id });
                      } catch (error) {
                        setChatStatus({
                          kind: "error",
                          message:
                            error instanceof Error
                              ? error.message
                              : "Network error",
                        });
                      }
                    });
                  }}
                >
                  <label className="block">
                    <span className="sr-only">Type a message</span>
                    <textarea
                      name="body"
                      rows={3}
                      value={draft}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        setDraft(event.target.value)
                      }
                      onKeyDown={(event) => {
                        // Cmd/Ctrl + Enter to send, matching the
                        // convention on the trip-review surface.
                        if (
                          (event.metaKey || event.ctrlKey) &&
                          event.key === "Enter"
                        ) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder="Type a message or drag a snippet here…"
                      data-testid="chat-composer-input"
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
                    <div className="flex items-center gap-3">
                      {chatStatus !== "idle" && chatStatus !== "submitting" ? (
                        <p
                          data-testid="chat-composer-status"
                          role={chatStatus.kind === "error" ? "alert" : "status"}
                          className={
                            chatStatus.kind === "error"
                              ? "font-mono-micro text-mono-micro text-red-700"
                              : "font-mono-micro text-mono-micro text-emerald-700"
                          }
                        >
                          {chatStatus.kind === "error"
                            ? chatStatus.message
                            : "Sent"}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={isChatPending || draft.trim().length === 0}
                        data-testid="chat-composer-send"
                        aria-label="Send message"
                        className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-ui text-label-ui px-4 py-2 rounded-lg hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span aria-hidden className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                        {isChatPending ? "Sending…" : "Send"}
                      </button>
                    </div>
                  </div>
                </form>
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
                <form
                  className="flex flex-col gap-3"
                  data-testid="push-to-timeline-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const formData = new FormData(form);
                    const payload = {
                      conversationId: activeConversation.id,
                      eventType: String(formData.get("eventType") ?? "activity"),
                      title: String(formData.get("title") ?? "").trim(),
                      eventDate: String(formData.get("eventDate") ?? ""),
                      eventTime: String(formData.get("eventTime") ?? ""),
                      internalNotes: String(formData.get("internalNotes") ?? "").trim() || undefined,
                    };
                    if (!payload.title) {
                      setTimelineStatus({ kind: "error", message: "Title is required." });
                      return;
                    }
                    if (!payload.eventDate || !payload.eventTime) {
                      setTimelineStatus({ kind: "error", message: "Date and time are required." });
                      return;
                    }
                    setTimelineStatus("submitting");
                    startTimelineTransition(async () => {
                      try {
                        const response = await fetch("/api/console/itinerary-events", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const data = (await response.json()) as {
                          ok?: boolean;
                          id?: string;
                          error?: string;
                        };
                        if (!response.ok || !data.ok || !data.id) {
                          setTimelineStatus({
                            kind: "error",
                            message: data.error ?? `HTTP ${response.status}`,
                          });
                          return;
                        }
                        setTimelineStatus({ kind: "ok", id: data.id });
                        // Refresh the Recent pushes list so the new
                        // event appears at the top (Phase 7.2).
                        void loadRecentEvents(activeConversation.id);
                        // Reset non-required fields so the operator can
                        // push a second event without first clearing the
                        // first one. Date and time are reset to a
                        // sensible near-future default.
                        form.reset();
                      } catch (error) {
                        setTimelineStatus({
                          kind: "error",
                          message:
                            error instanceof Error
                              ? error.message
                              : "Network error",
                        });
                      }
                    });
                  }}
                >
                  <label className="block">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                      Event Type
                    </span>
                    <select
                      name="eventType"
                      defaultValue="activity"
                      data-testid="push-event-type"
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
                      name="title"
                      type="text"
                      defaultValue="Camellia Tea Ceremony"
                      data-testid="push-event-title"
                      className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                        Date
                      </span>
                      <input
                        name="eventDate"
                        type="date"
                        defaultValue="2024-10-14"
                        data-testid="push-event-date"
                        className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                        Time
                      </span>
                      <input
                        name="eventTime"
                        type="time"
                        defaultValue="14:00"
                        data-testid="push-event-time"
                        className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light block mb-1">
                      Internal Notes
                    </span>
                    <textarea
                      name="internalNotes"
                      rows={2}
                      placeholder="For the team only…"
                      data-testid="push-event-notes"
                      className="w-full font-body-md text-body-md bg-white/10 border border-white/20 text-on-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ochre-light resize-none"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isTimelinePending}
                    data-testid="push-event-submit"
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-ochre-dark text-white font-label-ui text-label-ui px-4 py-2.5 rounded-lg hover:bg-ochre-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span aria-hidden className="material-symbols-outlined text-[18px]">
                      sync_alt
                    </span>
                    {isTimelinePending ? "Pushing…" : "Push to Timeline"}
                  </button>
                  {timelineStatus !== "idle" && timelineStatus !== "submitting" ? (
                    <p
                      data-testid="push-event-status"
                      role={timelineStatus.kind === "error" ? "alert" : "status"}
                      className={
                        timelineStatus.kind === "error"
                          ? "font-body-sm text-body-sm text-red-300"
                          : "font-body-sm text-body-sm text-emerald-300"
                      }
                    >
                      {timelineStatus.kind === "error"
                        ? `Error: ${timelineStatus.message}`
                        : `Recorded — id ${timelineStatus.id.slice(0, 8)}`}
                    </p>
                  ) : null}
                </form>

                <div
                  data-testid="recent-pushes"
                  className="border-t border-white/10 pt-4 mt-2"
                >
                  <h4 className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 flex items-center gap-2">
                    <span aria-hidden className="material-symbols-outlined text-[14px]">
                      history
                    </span>
                    Recent pushes
                  </h4>
                  {recentEventsLoading && recentEvents.length === 0 ? (
                    <p
                      data-testid="recent-pushes-loading"
                      className="font-body-sm text-body-sm text-on-primary/60 italic"
                    >
                      Loading…
                    </p>
                  ) : null}
                  {!recentEventsLoading && recentEvents.length === 0 ? (
                    <p
                      data-testid="recent-pushes-empty"
                      className="font-body-sm text-body-sm text-on-primary/60 italic"
                    >
                      Nothing pushed yet. The form above is the only way to
                      log an event for this conversation.
                    </p>
                  ) : null}
                  <ul
                    data-testid="recent-pushes-list"
                    className="flex flex-col gap-2"
                  >
                    {recentEvents.map((event) => (
                      <li
                        key={event.id}
                        data-testid="recent-push-item"
                        className="rounded-lg bg-white/5 border border-white/10 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
                            {event.eventType}
                          </span>
                          <span className="font-mono-technical text-mono-technical text-on-primary/60">
                            {event.eventDate} · {event.eventTime}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-primary">
                          {event.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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