"use client";

import * as React from "react";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

type Message = {
  id: string;
  role: "user" | "specialist";
  text: string;
  time?: string;
};

type LoadState = "loading" | "ready" | "empty" | "denied" | "error";

function normalizeMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const text = typeof row.body === "string" ? row.body : null;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (!id || !text?.trim()) return [];
    const author = row.authorRole === "traveler" || row.role === "user"
      ? "user"
      : row.authorRole === "specialist" || row.role === "specialist"
        ? "specialist"
        : null;
    if (!author) return [];
    return [{ id, role: author, text: text.trim(), time: typeof row.createdAt === "string" ? row.createdAt : undefined }];
  });
}

export interface ExpertChatProps {
  tripId: string;
}

export function ExpertChat({ tripId }: ExpertChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [state, setState] = React.useState<LoadState>("loading");
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const loadMessages = React.useCallback(async () => {
    setState("loading");
    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}/messages`, { credentials: "include" });
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        setState("denied");
        return;
      }
      if (!response.ok) throw new Error("provider");
      const payload = (await response.json()) as { messages?: unknown };
      const next = normalizeMessages(payload.messages);
      setMessages(next);
      setState(next.length ? "ready" : "empty");
    } catch {
      setState("error");
    }
  }, [tripId]);

  React.useEffect(() => { void loadMessages(); }, [loadMessages]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending || state === "denied" || state === "error") return;
    setSending(true);
    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body })
      });
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        setState("denied");
        return;
      }
      if (!response.ok) throw new Error("provider");
      setInput("");
      await loadMessages();
    } catch {
      setState("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md text-body-md">
        <main id="main-content" className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-container-padding-sm py-8">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Expert messages</h1>
          <p className="text-on-surface-variant mb-6">Trip {tripId}</p>
          <section aria-live="polite" className="flex-1 rounded-2xl border border-olive-light/15 bg-white/70 p-5">
            {state === "loading" && <p data-testid="chat-loading">Loading messages…</p>}
            {state === "denied" && <p data-testid="chat-denied">This conversation is not available for this trip.</p>}
            {state === "error" && <p data-testid="chat-provider-error">Messages are temporarily unavailable. Please try again later.</p>}
            {state === "empty" && <p data-testid="chat-empty-state">No messages yet. Your specialist will appear here when they reply.</p>}
            {(state === "ready" || state === "empty") && messages.length > 0 && (
              <div data-testid="chat-messages" className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <p className="max-w-[80%] rounded-2xl bg-surface-container-high px-4 py-3 whitespace-pre-wrap">{message.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          {state !== "denied" && state !== "error" && (
            <div className="mt-4 flex gap-2">
              <textarea aria-label="Message your specialist" value={input} onChange={(event) => setInput(event.target.value)} className="min-h-12 flex-1 rounded-xl border border-olive-light/20 p-3" placeholder="Write a message…" />
              <button type="button" onClick={() => void send()} disabled={sending || !input.trim()} className="rounded-xl bg-primary px-5 text-white disabled:opacity-50">{sending ? "Sending…" : "Send"}</button>
            </div>
          )}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
