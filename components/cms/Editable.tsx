import Image from "next/image";
import type { ElementType, ReactNode } from "react";
import { fieldMeta, schemaAt } from "@/lib/cms/fields";
import { getDocContent, getEditState } from "@/lib/cms/load";
import { getAt, joinPath } from "@/lib/cms/paths";
import { docSchema, type DocSlug } from "@/lib/cms/registry";
import { cn } from "@/lib/utils";
import { InlineImage } from "./InlineImage";
import { InlineSection } from "./InlineSection";
import { InlineText } from "./InlineText";

/** Where a piece of content lives: which document, and the dot path inside it. */
export type Bind = { doc: DocSlug; path: string };

export function at(bind: Bind, ...keys: Array<string | number>): Bind {
  return { doc: bind.doc, path: joinPath(bind.path, ...keys) };
}

async function contentEditing() {
  const edit = await getEditState();
  return edit.editing && edit.canEditContent;
}

function limitsFor(bind: Bind) {
  const meta = fieldMeta(schemaAt(docSchema(bind.doc), bind.path) ?? docSchema(bind.doc));
  return { max: meta?.max, multiline: meta?.kind === "textarea", label: meta?.label ?? "Text" };
}

/**
 * Visitors get the plain element. Editors (Draft Mode + admin) get an in-place editor
 * for the same element, so layout and styling are identical in both modes.
 */
export async function EditableText({
  bind,
  value,
  as: Tag = "span",
  className,
}: {
  bind: Bind;
  value: string;
  as?: ElementType;
  className?: string;
}) {
  if (!(await contentEditing())) return <Tag className={className}>{value}</Tag>;
  const limits = limitsFor(bind);
  return <InlineText bind={bind} value={value} as={typeof Tag === "string" ? Tag : "span"} className={className} {...limits} />;
}

export async function EditableImage({
  bind,
  altBind,
  src,
  alt,
  sizes,
  className,
  frameClassName,
  priority,
}: {
  bind: Bind;
  altBind: Bind;
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  frameClassName?: string;
  priority?: boolean;
}) {
  const editing = await contentEditing();
  if (!editing) {
    if (!src) return null;
    return (
      <div className={cn("relative", frameClassName)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
      </div>
    );
  }
  return (
    <InlineImage bind={bind} altBind={altBind} src={src} alt={alt} sizes={sizes} className={className} frameClassName={frameClassName} />
  );
}

/**
 * Wraps a page section. Hidden sections disappear for visitors; editors still see them
 * (dimmed) plus a "Section" button that opens the full field panel.
 */
export async function EditableSection({
  bind,
  label,
  visible = true,
  children,
}: {
  bind: Bind;
  label: string;
  visible?: boolean;
  children: ReactNode;
}) {
  const edit = await getEditState();
  if (!edit.editing || !edit.canEditContent) return visible ? <>{children}</> : null;
  const value = getAt(await getDocContent(bind.doc), bind.path) as Record<string, unknown>;
  return (
    <InlineSection bind={bind} label={label} visible={visible} value={value} hideable={"visible" in value}>
      {children}
    </InlineSection>
  );
}
