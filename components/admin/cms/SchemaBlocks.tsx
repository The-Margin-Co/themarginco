"use client";

import { CircleCheck, CircleX, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { inputStyles } from "@/components/ui/FormField";
import { isJsonObject, SCHEMA_TEMPLATES, type PageSeo } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import { Toggle } from "./inputs";
import { FormSection } from "./PageSeoFields";

type Block = PageSeo["schemas"][number];

function jsonError(json: string) {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "The schema must be a JSON object { … }.";
    if (!("@type" in parsed) || !(parsed as Record<string, unknown>)["@type"]) return 'Add an "@type", e.g. "Service".';
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON.";
  }
}

export function SchemaBlocks({
  blocks,
  onChange,
  autoSchemas,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  /** Schemas the page already emits automatically, shown for context. */
  autoSchemas: { name: string; active: boolean; note?: string }[];
}) {
  const [type, setType] = useState("Service");
  const update = (index: number, patch: Partial<Block>) => onChange(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));

  return (
    <div className="space-y-6">
      <FormSection title="Automatic structured data" description="Generated from this page's content. Nothing to maintain.">
        <ul className="space-y-2">
          {autoSchemas.map((schema) => (
            <li key={schema.name} className="flex items-center gap-2.5 text-sm">
              {schema.active ? (
                <CircleCheck aria-hidden className="size-4 text-success" />
              ) : (
                <CircleX aria-hidden className="size-4 text-zinc-600" />
              )}
              <span className={schema.active ? "text-fg" : "text-zinc-500"}>{schema.name}</span>
              {schema.note && <span className="text-xs text-zinc-500">· {schema.note}</span>}
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection
        title="Custom schema blocks"
        description="Add extra JSON-LD (e.g. LocalBusiness, HowTo, Review). Each block is validated before it can be saved."
      >
        {blocks.length === 0 && <p className="text-sm text-zinc-500">No custom schema yet.</p>}
        <ol className="space-y-4">
          {blocks.map((block, index) => {
            const error = jsonError(block.json);
            return (
              <li key={block.id} className={cn("rounded-xl border p-4", error ? "border-danger/60" : "border-line")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <input
                    aria-label="Schema label"
                    value={block.type}
                    onChange={(event) => update(index, { type: event.target.value })}
                    className={inputStyles(false, "w-48 py-1.5 text-sm font-semibold")}
                  />
                  <div className="flex items-center gap-3">
                    <Toggle label="Enabled" checked={block.enabled} onChange={(enabled) => update(index, { enabled })} />
                    <button
                      type="button"
                      aria-label="Remove schema"
                      onClick={() => onChange(blocks.filter((_, i) => i !== index))}
                      className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  aria-label={`${block.type} JSON`}
                  value={block.json}
                  spellCheck={false}
                  rows={Math.min(18, Math.max(6, block.json.split("\n").length + 1))}
                  onChange={(event) => update(index, { json: event.target.value })}
                  className={inputStyles(Boolean(error), "mt-3 resize-y font-mono text-xs leading-relaxed")}
                />
                <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs", error ? "text-danger" : "text-success")}>
                  {error ? <CircleX aria-hidden className="size-3.5" /> : <CircleCheck aria-hidden className="size-3.5" />}
                  {error ?? "Valid JSON-LD"}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <select aria-label="Schema type" value={type} onChange={(event) => setType(event.target.value)} className={inputStyles(false, "w-52 py-2")}>
            {Object.keys(SCHEMA_TEMPLATES).map((name) => (
              <option key={name} value={name}>
                {name === "Custom" ? "Custom (blank)" : name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={blocks.length >= 20}
            onClick={() =>
              onChange([
                ...blocks,
                {
                  id: crypto.randomUUID().slice(0, 12),
                  type,
                  enabled: true,
                  json: JSON.stringify(SCHEMA_TEMPLATES[type], null, 2),
                },
              ])
            }
            className="flex h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg hover:border-accent/60 hover:text-gold disabled:opacity-40"
          >
            <Plus aria-hidden className="size-3.5" /> Add schema block
          </button>
          {blocks.some((block) => !isJsonObject(block.json)) && (
            <span className="text-xs text-danger">Fix invalid blocks before saving.</span>
          )}
        </div>
      </FormSection>
    </div>
  );
}
