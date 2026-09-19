"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type ReactNode } from "react";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { inputStyles } from "@/components/ui/FormField";
import { ICON_NAMES } from "@/lib/cms/icons";
import { IMAGE_ACCEPT } from "@/lib/media";
import { altFromFilename, uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

export function FieldShell({
  id,
  label,
  help,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  counter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {help && !error && <p className="mt-1.5 text-xs text-zinc-500">{help}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Counter({ length, max }: { length: number; max?: number }) {
  if (!max) return null;
  const tone = length > max ? "text-danger" : length > max * 0.9 ? "text-gold" : "text-zinc-500";
  return (
    <span className={cn("text-xs tabular-nums", tone)}>
      {length}/{max}
    </span>
  );
}

type Base = { label: string; help?: string; error?: string };

export function TextInput({
  label,
  help,
  error,
  value,
  onChange,
  max,
  placeholder,
  type = "text",
}: Base & { value: string; onChange: (value: string) => void; max?: number; placeholder?: string; type?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error} counter={<Counter length={value.length} max={max} />}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputStyles(Boolean(error), "py-2.5")}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  help,
  error,
  value,
  onChange,
  max,
  rows = 3,
  placeholder,
}: Base & { value: string; onChange: (value: string) => void; max?: number; rows?: number; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error} counter={<Counter length={value.length} max={max} />}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputStyles(Boolean(error), "resize-y py-2.5")}
      />
    </FieldShell>
  );
}

export function NumberInput({
  label,
  help,
  error,
  value,
  onChange,
  min,
  max,
  step,
}: Base & { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
        className={inputStyles(Boolean(error), "py-2.5 tabular-nums")}
      />
    </FieldShell>
  );
}

export function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {help && <p className="mt-0.5 text-xs text-zinc-500">{help}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent bg-accent" : "border-line bg-ink",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4.5 rounded-full transition-all",
            checked ? "left-[1.35rem] bg-ink" : "left-0.5 bg-zinc-500",
          )}
        />
      </button>
    </div>
  );
}

export function IconSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label}>
      <div className="flex items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-gold">
          <CmsIcon name={value} className="size-5" />
        </span>
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputStyles(false, "py-2.5")}>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </option>
          ))}
        </select>
      </div>
    </FieldShell>
  );
}

export function ImageInput({
  label,
  help,
  error,
  value,
  onChange,
  onAltSuggestion,
}: Base & { value: string; onChange: (value: string) => void; onAltSuggestion?: (alt: string) => void }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await uploadImage(file));
      onAltSuggestion?.(altFromFilename(file.name));
    } catch (problem) {
      setUploadError(problem instanceof Error ? problem.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldShell id={id} label={label} help={help} error={uploadError ?? error}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          void handle(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <div className="relative grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-ink">
          {value ? (
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          ) : uploading ? (
            <LoaderCircle aria-hidden className="size-5 animate-spin text-gold" />
          ) : (
            <ImagePlus aria-hidden className="size-5 text-zinc-600" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-9 rounded-lg border border-line px-3 text-xs font-semibold text-fg transition-colors hover:border-accent/60 hover:text-gold"
          >
            {uploading ? "Uploading…" : value ? "Replace" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-danger hover:bg-danger/10"
            >
              <Trash2 aria-hidden className="size-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </FieldShell>
  );
}
