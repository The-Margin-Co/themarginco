"use client";

import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { z } from "zod";
import { emptyFor } from "@/lib/cms/empty";
import { fieldMeta } from "@/lib/cms/fields";
import { joinPath } from "@/lib/cms/paths";
import { cn } from "@/lib/utils";
import { IconSelect, ImageInput, NumberInput, TextArea, TextInput, Toggle } from "./inputs";

type Errors = Record<string, string>;
type NodeProps = {
  schema: z.ZodType;
  value: unknown;
  onChange: (value: unknown) => void;
  errors: Errors;
  path: string;
  name: string;
};

/** Human label fallback for fields without metadata, e.g. "primaryHref" -> "Primary href". */
function humanize(key: string) {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function preview(item: unknown, fallback: string) {
  if (typeof item === "string") return item || fallback;
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    for (const key of ["title", "question", "name", "label", "value", "quote", "industry"]) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }
  return fallback;
}

/** Renders every field of an object schema. Used for whole pages and single sections. */
export function SchemaForm({
  schema,
  value,
  onChange,
  errors = {},
  path = "",
  sectionIds = false,
}: {
  schema: z.ZodObject;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors?: Errors;
  path?: string;
  sectionIds?: boolean;
}) {
  return (
    <div className="space-y-5">
      {Object.entries(schema.shape).map(([key, child]) => (
        <div key={key} id={sectionIds ? `section-${key}` : undefined} className={sectionIds ? "scroll-mt-28" : undefined}>
          <FieldNode
            schema={child as z.ZodType}
            value={value[key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
            errors={errors}
            path={joinPath(path, key)}
            name={key}
          />
        </div>
      ))}
    </div>
  );
}

function FieldNode({ schema, value, onChange, errors, path, name }: NodeProps) {
  const meta = fieldMeta(schema);
  const label = meta?.label ?? humanize(name);
  const error = errors[path];

  switch (meta?.kind) {
    case "text":
    case "url":
      return (
        <TextInput
          label={label}
          help={meta.help}
          error={error}
          value={String(value ?? "")}
          max={meta.max}
          placeholder={meta.kind === "url" ? "https://… or /path" : undefined}
          onChange={onChange}
        />
      );
    case "textarea":
      return <TextArea label={label} help={meta.help} error={error} value={String(value ?? "")} max={meta.max} onChange={onChange} />;
    case "number":
      return (
        <NumberInput
          label={label}
          error={error}
          value={Number(value ?? 0)}
          min={meta.min}
          max={meta.max}
          step={meta.step}
          onChange={onChange}
        />
      );
    case "toggle":
      return <Toggle label={label} help={meta.help} checked={Boolean(value)} onChange={onChange} />;
    case "icon":
      return <IconSelect label={label} value={String(value ?? "")} onChange={onChange} />;
    case "image":
      return <ImageInput label={label} help={meta.help} error={error} value={String(value ?? "")} onChange={onChange} />;
    case "list":
      return (
        <ListField
          schema={schema as z.ZodArray}
          label={label}
          itemLabel={meta.itemLabel ?? "Item"}
          min={meta.min ?? 0}
          max={meta.max ?? 50}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          errors={errors}
          path={path}
        />
      );
    case "section":
      return (
        <SectionCard
          label={label}
          hideable={Boolean(meta.hideable)}
          schema={schema as z.ZodObject}
          value={(value ?? {}) as Record<string, unknown>}
          onChange={onChange}
          errors={errors}
          path={path}
        />
      );
    case "group":
      return (
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</legend>
          <SchemaForm schema={schema as z.ZodObject} value={(value ?? {}) as Record<string, unknown>} onChange={onChange} errors={errors} path={path} />
        </fieldset>
      );
    default:
      if (schema instanceof z.ZodObject) {
        return <SchemaForm schema={schema} value={(value ?? {}) as Record<string, unknown>} onChange={onChange} errors={errors} path={path} />;
      }
      if (schema instanceof z.ZodBoolean) return <Toggle label={label} checked={Boolean(value)} onChange={onChange} />;
      return <TextInput label={label} error={error} value={String(value ?? "")} onChange={onChange} />;
  }
}

function SectionCard({
  label,
  hideable,
  schema,
  value,
  onChange,
  errors,
  path,
}: {
  label: string;
  hideable: boolean;
  schema: z.ZodObject;
  value: Record<string, unknown>;
  onChange: (value: unknown) => void;
  errors: Errors;
  path: string;
}) {
  const [open, setOpen] = useState(true);
  const visible = value.visible !== false;
  const bodySchema = hideable
    ? z.object(Object.fromEntries(Object.entries(schema.shape).filter(([key]) => key !== "visible")))
    : schema;
  const hasErrors = Object.keys(errors).some((key) => key === path || key.startsWith(`${path}.`));

  return (
    <section className={cn("card overflow-hidden", !visible && "opacity-70", hasErrors && "border-danger/60")}>
      <header className="flex items-center justify-between gap-3 border-b border-line bg-ink-2/50 px-4 py-3">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="flex min-w-0 items-center gap-2 text-left">
          <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition-transform", !open && "-rotate-90")} />
          <span className="truncate text-sm font-semibold text-fg">{label}</span>
          {!visible && <span className="rounded-full bg-fg/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Hidden</span>}
          {hasErrors && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">Needs attention</span>}
        </button>
        {hideable && (
          <button
            type="button"
            onClick={() => onChange({ ...value, visible: !visible })}
            aria-pressed={visible}
            title={visible ? "Visible on the site. Click to hide." : "Hidden from visitors. Click to show."}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
              visible ? "text-success hover:bg-success/10" : "text-muted hover:bg-fg/5",
            )}
          >
            {visible ? <Eye aria-hidden className="size-4" /> : <EyeOff aria-hidden className="size-4" />}
            {visible ? "Visible" : "Hidden"}
          </button>
        )}
      </header>
      {open && (
        <div className="p-4 sm:p-5">
          <SchemaForm schema={bodySchema as z.ZodObject} value={value} onChange={(next) => onChange({ ...value, ...next })} errors={errors} path={path} />
        </div>
      )}
    </section>
  );
}

function ListField({
  schema,
  label,
  itemLabel,
  min,
  max,
  value,
  onChange,
  errors,
  path,
}: {
  schema: z.ZodArray;
  label: string;
  itemLabel: string;
  min: number;
  max: number;
  value: unknown[];
  onChange: (value: unknown) => void;
  errors: Errors;
  path: string;
}) {
  const itemSchema = schema.element as z.ZodType;
  const simple = !(itemSchema instanceof z.ZodObject);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    if (openIndex === from) setOpenIndex(to);
  };
  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setOpenIndex(null);
  };
  const add = (template?: unknown) => {
    onChange([...value, template ?? emptyFor(itemSchema)]);
    setOpenIndex(value.length);
  };

  const listError = errors[path];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-fg">
          {label} <span className="text-xs font-normal text-zinc-500">({value.length}{max < 50 ? ` / ${max}` : ""})</span>
        </p>
      </div>
      {listError && <p className="mb-2 text-xs text-danger">{listError}</p>}

      <ol className="space-y-2">
        {value.map((item, index) => {
          const itemPath = joinPath(path, index);
          const controls = (
            <div className="flex shrink-0 items-center">
              <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton label="Move down" disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton label="Duplicate" disabled={value.length >= max} onClick={() => add(structuredClone(item))}>
                <Copy className="size-3.5" />
              </IconButton>
              <IconButton label="Remove" danger disabled={value.length <= min} onClick={() => remove(index)}>
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          );

          if (simple) {
            return (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-3 w-5 shrink-0 text-right text-xs tabular-nums text-zinc-500">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <FieldNode schema={itemSchema} value={item} onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))} errors={errors} path={itemPath} name={itemLabel} />
                </div>
                <div className="mt-7">{controls}</div>
              </li>
            );
          }

          const open = openIndex === index;
          const itemHasError = Object.keys(errors).some((key) => key.startsWith(`${itemPath}.`));
          return (
            <li key={index} className={cn("rounded-xl border bg-ink/40", itemHasError ? "border-danger/60" : "border-line")}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
                >
                  <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition-transform", !open && "-rotate-90")} />
                  <span className="shrink-0 text-xs font-semibold text-zinc-500">
                    {itemLabel} {index + 1}
                  </span>
                  <span className="truncate text-fg">{preview(item, "Untitled")}</span>
                </button>
                {controls}
              </div>
              {open && (
                <div className="border-t border-line p-3 sm:p-4">
                  <SchemaForm
                    schema={itemSchema as z.ZodObject}
                    value={(item ?? {}) as Record<string, unknown>}
                    onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))}
                    errors={errors}
                    path={itemPath}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => add()}
        disabled={value.length >= max}
        className="mt-2 flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-line px-3 text-xs font-semibold text-muted transition-colors hover:border-accent/60 hover:text-gold disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus aria-hidden className="size-3.5" /> Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function IconButton({
  label,
  danger = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30",
        danger ? "text-muted hover:bg-danger/10 hover:text-danger" : "text-muted hover:bg-fg/5 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
