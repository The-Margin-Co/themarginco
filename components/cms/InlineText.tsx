"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { Bind } from "./Editable";
import { resolveValue, useEditMode } from "./edit/store";

function clean(text: string, multiline: boolean) {
  const normalised = text.replace(/\u00a0/g, " ");
  return multiline ? normalised : normalised.replace(/\s*\n\s*/g, " ");
}

function selectedLength(element: HTMLElement) {
  const selection = window.getSelection();
  return selection && element.contains(selection.anchorNode) ? selection.toString().length : 0;
}

/**
 * Plain-text field edited in place. React renders the server value once; while the editor
 * types, the DOM is the source of truth and every change is mirrored into the edit store.
 */
export function InlineText({
  bind,
  value,
  as: Tag,
  className,
  max,
  multiline,
  label,
}: {
  bind: Bind;
  value: string;
  as: string;
  className?: string;
  max?: number;
  multiline: boolean;
  label: string;
}) {
  const edit = useEditMode();
  const ref = useRef<HTMLElement>(null);
  const current = edit ? resolveValue(edit.patches, bind, value) : value;
  const error = edit?.errors[bind.doc]?.[bind.path];
  const dirty = current !== value;

  // Keep the DOM in sync with edits made elsewhere (section panel, discard) unless the user is typing here.
  useEffect(() => {
    const element = ref.current;
    if (element && document.activeElement !== element && element.textContent !== current) element.textContent = current;
  }, [current]);

  const Element = Tag as "span";
  if (!edit) return <Element className={className}>{value}</Element>;

  function commit(element: HTMLElement) {
    edit?.setValue(bind, clean(element.textContent ?? "", multiline), value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    event.stopPropagation();
    // Fields are single paragraphs on the page, so Enter finishes editing rather than adding a line.
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.currentTarget.textContent = current;
      event.currentTarget.blur();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    let text = clean(event.clipboardData.getData("text/plain"), multiline);
    if (max) text = text.slice(0, Math.max(0, max - (element.textContent ?? "").length + selectedLength(element)));
    if (text) document.execCommand("insertText", false, text);
  }

  // Links, buttons and <summary> would navigate/toggle on click; in edit mode the click places the caret.
  function onClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a, button, summary, label")) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return (
    <Element
      ref={ref}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      aria-multiline={multiline}
      aria-invalid={error ? true : undefined}
      spellCheck
      title={error ?? (max ? `${label} · max ${max} characters` : label)}
      data-cms-text=""
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={(event) => event.stopPropagation()}
      onPaste={onPaste}
      onBeforeInput={(event) => {
        const element = event.currentTarget;
        const incoming = (event as unknown as { data?: string }).data ?? "";
        if (max && (element.textContent ?? "").length - selectedLength(element) + incoming.length > max) event.preventDefault();
      }}
      onInput={(event) => commit(event.currentTarget)}
      onBlur={(event) => commit(event.currentTarget)}
      className={cn(
        className,
        "cursor-text rounded-[3px] outline-none transition-[box-shadow,background-color] [overflow-wrap:anywhere]",
        "hover:shadow-[0_0_0_2px_rgb(250_204_21/0.45)] focus:bg-accent/[0.06] focus:shadow-[0_0_0_2px_rgb(250_204_21)]",
        dirty && "shadow-[0_0_0_1px_rgb(250_204_21/0.6)]",
        error && "shadow-[0_0_0_2px_rgb(248_113_113)] hover:shadow-[0_0_0_2px_rgb(248_113_113)]",
      )}
    >
      {value}
    </Element>
  );
}
