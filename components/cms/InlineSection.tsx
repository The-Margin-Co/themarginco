"use client";

import { Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { joinPath } from "@/lib/cms/paths";
import { cn } from "@/lib/utils";
import type { Bind } from "./Editable";
import { resolveValue, useEditMode } from "./edit/store";

/**
 * Editor chrome around a page section: hover outline, a "Section" button that opens the full
 * field panel (lists, icons, links) and a show/hide toggle. Hidden sections stay visible here, dimmed.
 */
export function InlineSection({
  bind,
  label,
  visible,
  value,
  hideable,
  children,
}: {
  bind: Bind;
  label: string;
  visible: boolean;
  value: Record<string, unknown>;
  hideable: boolean;
  children: ReactNode;
}) {
  const edit = useEditMode();
  const syncSection = edit?.syncSection;
  useEffect(() => {
    syncSection?.(bind, value);
  }, [syncSection, bind, value]);

  if (!edit) return visible ? <>{children}</> : null;

  const visibleBind = { doc: bind.doc, path: joinPath(bind.path, "visible") };
  const shown = hideable ? resolveValue(edit.patches, visibleBind, visible) : true;
  const hasErrors = Object.keys(edit.errors[bind.doc] ?? {}).some((path) => path === bind.path || path.startsWith(`${bind.path}.`));

  return (
    <div
      data-cms-section={label}
      className={cn(
        "group/section relative outline-2 -outline-offset-2 outline-transparent transition-[outline-color] hover:outline-dashed hover:outline-accent/50",
        hasErrors && "outline-dashed outline-danger/70",
      )}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-40 flex gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/section:opacity-100 [&>*]:pointer-events-auto">
        <button
          type="button"
          onClick={() => edit.openSection({ bind, label, value })}
          className="flex h-8 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-bold text-on-accent shadow-lg hover:bg-accent-2"
        >
          <SlidersHorizontal aria-hidden className="size-3.5" /> {label}
        </button>
        {hideable && (
          <button
            type="button"
            aria-pressed={!shown}
            onClick={() => edit.setValue(visibleBind, !shown, visible)}
            className="flex h-8 items-center gap-1.5 rounded-full bg-ink/90 px-3 text-xs font-semibold text-fg shadow-lg backdrop-blur hover:text-gold"
          >
            {shown ? <EyeOff aria-hidden className="size-3.5" /> : <Eye aria-hidden className="size-3.5" />}
            {shown ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {!shown && (
        <div className="absolute inset-x-0 top-0 z-30 flex justify-center">
          <span className="mt-3 rounded-full border border-line bg-ink/90 px-3 py-1 text-xs font-semibold text-muted">
            Hidden from visitors
          </span>
        </div>
      )}
      <div className={cn(!shown && "opacity-35 grayscale")}>{children}</div>
    </div>
  );
}
