"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteFooter } from "../../_components/site-footer";
import { ConversationList } from "./_components/conversation-list";
import {
  MessageThread,
  type ChatMessage,
  type SendMessageResult,
} from "./_components/message-thread";
import {
  TriagePanel,
  type ItineraryEvent,
  type PushPayload,
  type PushResult,
} from "./_components/triage-panel";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { triageInboundMessage } from "../_components/message-triage";
import type { TriageResult } from "@repo/ai";
import { DAYS } from "./_lib/conversations";

export default function ConsoleMessagesPage() {
  const [activeId, setActiveId] = useState<string>(DAYS[0]!.id);
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
  // Loaded chat-message history for the active conversation.
  // Phase 7: read from /api/console/chat-messages on mount + when
  // activeId changes. Renders the operator's and traveler's
  // bubbles above the composer.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  // Phase 7.2: itinerary-event history for the active
  // conversation. Drives the "Recent pushes" section in the
  // right-side Update Timeline panel so the operator can see
  // what they've already pushed (and what other operators
  // have pushed from the same conversation).
  const [recentEvents, setRecentEvents] = useState<ItineraryEvent[]>([]);
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
          messages?: ChatMessage[];
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
          events?: ItineraryEvent[];
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

  const activeDay =
    DAYS.find((d) => d.id === activeId) ?? DAYS[0]!;

  // Phase 3.1: "Push to Timeline" submit callback. Network
  // concern lives in the page; the TriagePanel component handles
  // form state, validation, and the post-submit list refresh.
  const pushItineraryEvent = useCallback(
    async (payload: PushPayload): Promise<PushResult> => {
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
          return { ok: false, error: data.error ?? `HTTP ${response.status}` };
        }
        return { ok: true, id: data.id };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : "Network error",
        };
      }
    },
    []
  );

  // Phase 3.2: chat-composer submit callback. Network concern
  // lives in the page; the MessageThread component handles
  // optimistic insert + status display.
  const sendChatMessage = useCallback(
    async (body: string): Promise<SendMessageResult> => {
      try {
        const response = await fetch("/api/console/chat-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeDay.id,
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
          return { ok: false, error: data.error ?? `HTTP ${response.status}` };
        }
        return { ok: true, id: data.id, createdAt: data.createdAt };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : "Network error",
        };
      }
    },
    [activeDay.id]
  );

  return (
    <>
      <div className="md:ml-64 min-w-0 min-h-screen flex flex-col bg-background relative overflow-x-hidden">
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-cover bg-center opacity-40 blur-sm pointer-events-none"
          style={{
            backgroundImage:
              "url('/trip-covers/lisbon-tagus.svg')",
          }}
        />
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-glass-light/30 pointer-events-none"
        />

        <main id="main-content" className="relative z-10 flex-1 h-screen flex gap-gutter p-container-padding-sm overflow-hidden">
          <h1 className="sr-only">Messaging Hub</h1>
          <p className="absolute top-2 left-1/2 -translate-x-1/2 z-20 rounded-full border border-ochre-light/40 bg-primary/90 px-3 py-1 font-mono-micro text-mono-micro uppercase tracking-wider text-ochre-light shadow-sm">
            Demo data · Portugal sample itinerary
          </p>
          {/* Column 1: Itinerary Days */}
          <ConversationList
            days={DAYS}
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
          <MessageThread
            activeDay={activeDay}
            messages={messages}
            messagesLoading={messagesLoading}
            messagesError={messagesError}
            isLive={isLive}
            incomingCount={incomingCount}
            lastTriage={lastTriage}
            onSend={sendChatMessage}
          />

          {/* Column 3: Tools & Context */}
          <TriagePanel
            activeDay={activeDay}
            recentEvents={recentEvents}
            recentEventsLoading={recentEventsLoading}
            onRefreshRecent={loadRecentEvents}
            onPush={pushItineraryEvent}
          />
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
