import { useState, type DragEvent } from "react";
import { Icon } from "@repo/ui";

export interface SnippetCardProps {
  title: string;
  body: string;
}

/**
 * SnippetCard — 2.3 reference: draggable message snippet.
 *
 * Source: docs/reference/rumia-console/2.3-specialist-messaging-hub.html
 *
 * The card is `draggable`. On drag start we set `text/plain` to the
 * full snippet text (title + body, two newlines between) so that when
 * the operator drops the card on the chat textarea, the draft gets a
 * readable block — not just a title. The reference uses the body's
 * `data-fulltext` attribute for the same effect.
 */
export function SnippetCard({ title, body }: SnippetCardProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", `${title}\n\n${body}`);
    event.dataTransfer.effectAllowed = "copy";
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group bg-white border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none flex gap-2 items-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${
        dragging
          ? "border-ochre-light opacity-60"
          : "border-outline-variant/30 hover:border-ochre-light/50 hover:shadow-sm"
      }`}
      tabIndex={0}
      role="button"
      aria-label={`Drag snippet: ${title}`}
    >
      <Icon aria-hidden="true" name="drag_indicator" className="text-[14px] text-outline group-hover:text-ochre-light mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-label-ui text-label-ui text-primary truncate">
          {title}
        </p>
        <p
          data-fulltext={body}
          className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1"
        >
          {body}
        </p>
      </div>
    </div>
  );
}
