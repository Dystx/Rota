"use client";

import type { ChangeEvent } from "react";
import type { Conversation } from "../_lib/conversations";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  /** Number of unread messages since the user last opened a
   *  conversation. Drives the small "N new" badge above the
   *  list. The parent is responsible for clearing this when
   *  the user opens a conversation (see onSelect handler). */
  incomingCount: number;
}

/**
 * ConversationList — the leftmost column of the /console/messages
 * 3-column kanban. Renders the "Active Threads" header, a
 * client-side search filter, and a scrollable list of
 * conversation rows. Each row is a <button> with aria-pressed
 * for selection state.
 *
 * Extracted from the 1067-line page so the parent can stay
 * focused on orchestration (state, realtime, triage) and the
 * list can be tested / styled / lazy-loaded independently.
 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  search,
  onSearchChange,
  incomingCount
}: ConversationListProps) {
  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col bg-glass-light backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden">
      <header className="p-4 border-b border-olive-light/10 flex items-center justify-between shrink-0">
        <h2 className="font-headline-sm text-headline-sm text-primary">Active Threads</h2>
        <button
          type="button"
          aria-label="Filter conversations"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <span aria-hidden className="material-symbols-outlined">filter_list</span>
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
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search by name, region, or last message…"
            data-testid="conversations-search"
            className="w-full font-body-md text-body-md pl-10 pr-4 py-2 rounded-lg bg-white/60 border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
          />
        </label>
        {incomingCount > 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-xs text-ochre-dark font-medium"
          >
            {incomingCount} new since you last looked
          </p>
        ) : null}
      </div>
      <ul className="flex-1 overflow-y-auto">
        {conversations
          .filter((conversation) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
              conversation.name.toLowerCase().includes(q) ||
              conversation.region.toLowerCase().includes(q) ||
              conversation.lastMessage.toLowerCase().includes(q)
            );
          })
          .map((conversation) => {
            const isSelected = conversation.id === activeId;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-4 border-b border-olive-light/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1 ${
                    isSelected
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
            );
          })}
      </ul>
    </aside>
  );
}
