"use client";

import {
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import type { TriageResult } from "@repo/ai";
import { Icon } from "@repo/ui";
import { formatChatTimestamp, type Day } from "../_lib/conversations";

/**
 * Persisted chat row. Read-only on the client: the parent owns the
 * realtime + history fetch and feeds us a stable list. The thread
 * component only adds optimistic, locally-sent messages on top.
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  authorRole: "operator" | "traveler";
  body: string;
  createdAt: string;
}

/**
 * Result envelope for the `onSend` callback. The thread is responsible
 * for optimistic-insert + UI state; the parent provides the actual
 * HTTP call so the network concern stays in one place.
 */
export type SendMessageResult =
  | { ok: true; id: string; createdAt: string }
  | { ok: false; error: string };

interface MessageThreadProps {
  activeDay: Day;
  messages: ReadonlyArray<ChatMessage>;
  messagesLoading: boolean;
  messagesError: string | null;
  isLive: boolean;
  incomingCount: number;
  lastTriage: TriageResult | null;
  onSend: (body: string) => Promise<SendMessageResult>;
}

/**
 * Column 2: the chat terminal. Header (avatar + presence + triage
 * badge), scrollable message list (loading/error/empty/bubbles), and
 * drag-and-drop composer. The parent owns realtime, history fetch,
 * and the network call; this component is a pure controlled surface
 * plus local UI state (draft, drag-over, submission status).
 */
export function MessageThread({
  activeDay,
  messages,
  messagesLoading,
  messagesError,
  isLive,
  incomingCount,
  lastTriage,
  onSend,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
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

  // Merge server-loaded messages with the operator's optimistic
  // inserts. `sentMessages` is keyed by the row id returned from
  // the API (so dedupe is by id); `messages` is the canonical
  // list. Anything in `sentMessages` not yet in `messages` (race
  // between fetch and the optimistic insert) is appended.
  const visibleMessages = useMemo(() => {
    const knownIds = new Set(messages.map((m) => m.id));
    const optimistic = sentMessages
      .filter((m) => !knownIds.has(m.id))
      .map((m) => ({
        id: m.id,
        conversationId: activeDay.id,
        authorRole: "operator" as const,
        body: m.body,
        createdAt: m.createdAt,
      }));
    return [...messages, ...optimistic];
  }, [messages, sentMessages, activeDay.id]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const data = event.dataTransfer.getData("text/plain");
    if (data) {
      setDraft((current) => (current ? `${current}\n${data}` : data));
    }
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setChatStatus({ kind: "error", message: "Message is empty." });
      return;
    }
    setChatStatus("submitting");
    const body = trimmed;
    startChatTransition(async () => {
      let result: SendMessageResult;
      try {
        result = await onSend(body);
      } catch (error) {
        setChatStatus({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Network error",
        });
        return;
      }
      if (!result.ok) {
        setChatStatus({ kind: "error", message: result.error });
        return;
      }
      // Optimistic insert into the local list so the operator
      // sees the message immediately. The Realtime channel will
      // de-dupe if the same row comes back from the server.
      setSentMessages((current) => {
        if (current.some((m) => m.id === result.id)) return current;
        return [
          ...current,
          { id: result.id, body, createdAt: result.createdAt },
        ];
      });
      setDraft("");
      setChatStatus({ kind: "ok", id: result.id });
    });
  }

  return (
    <section className="w-full min-h-[28rem] min-w-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden lg:min-h-0 lg:flex-1">
      <header className="px-6 py-4 border-b border-olive-light/10 bg-white/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={activeDay.avatarSrc.replace("40", "48")}
            alt={`${activeDay.name} avatar`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              <span className="block truncate">{activeDay.name}</span>
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
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
            <Icon name="person" />
          </button>
          <button
            type="button"
            aria-label="Open itinerary map"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <Icon name="map" />
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
          messagesError.toLowerCase().includes("forbidden") ? (
            // Auth-gated surface — show a friendly sign-in prompt
            // rather than the raw "Forbidden: unauthenticated"
            // string. The /console/* routes are operator-only and
            // anyone landing here without a session is a real
            // user who needs a clear next step.
            <div
              data-testid="chat-thread-forbidden"
              role="status"
              className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4 rounded-2xl border border-olive-light/30 bg-white/60 backdrop-blur"
            >
              <Icon name="lock" className="text-[40px] text-ochre-light" />
              <div className="flex flex-col gap-1.5 max-w-sm">
                <h2 className="font-display text-xl text-foreground">
                  Operator sign-in required
                </h2>
                <p className="font-body text-sm text-foreground/70 leading-relaxed">
                  The messaging hub is for the Rumia team. Sign in with
                  your operator account to load today&apos;s conversations.
                </p>
              </div>
              <a
                href="/sign-in?next=/console/messages"
                className="inline-flex items-center gap-2 bg-ink text-cream font-medium text-sm px-5 py-2.5 rounded-full hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                Sign in
                <Icon name="arrow-right" className="text-[16px]" />
              </a>
            </div>
          ) : (
            <div
              data-testid="chat-thread-error"
              role="alert"
              className="font-body-md text-body-md text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {messagesError}
            </div>
          )
        ) : null}
        {!messagesLoading && !messagesError && messages.length === 0 ? (
          <div
            data-testid="chat-thread-empty"
            className="flex flex-col items-center justify-center text-center py-12 gap-2"
          >
            <Icon name="chat-circle-dots" className="text-4xl text-on-surface-variant" />
            <p className="font-headline-sm text-headline-sm text-primary">
              No messages yet
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Send the first message below to start the conversation with{" "}
              {activeDay.name}.
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
                src={activeDay.avatarSrc}
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
            onSubmit={handleSubmit}
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
                  <Icon name="attach_file" />
                </button>
                <button
                  type="button"
                  aria-label="AI assistance"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <Icon name="sparkle" />
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
                  <Icon name="send" className="text-[18px]" />
                  {isChatPending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
