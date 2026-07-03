import { useState, type DragEvent } from "react";

export interface SnippetCardProps {
  title: string;
  body: string;
}

export function SnippetCard({ title, body }: SnippetCardProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", title);
    event.dataTransfer.effectAllowed = "copy";
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 ${
        dragging ? "border-ochre-light opacity-60" : "border-outline-variant/30"
      }`}
      tabIndex={0}
      role="button"
      aria-label={`Drag snippet: ${title}`}
    >
      <p className="font-label-ui text-label-ui text-primary truncate">{title}</p>
      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1">
        {body}
      </p>
    </div>
  );
}