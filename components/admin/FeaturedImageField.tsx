"use client";

import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { FormField, inputStyles } from "@/components/ui/FormField";
import { IMAGE_ACCEPT } from "@/lib/media";
import { altFromFilename, uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

export function FeaturedImageField({
  url,
  alt,
  altError,
  imageError,
  onUrlChange,
  onAltChange,
  onAltBlur,
}: {
  url: string;
  alt: string;
  altError?: string | null;
  imageError?: string | null;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  onAltBlur: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      onUrlChange(await uploadImage(file));
      if (!alt.trim()) onAltChange(altFromFilename(file.name));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  const error = uploadError ?? imageError;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {url ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "group relative aspect-[1200/630] overflow-hidden rounded-xl border bg-ink",
            dragging ? "border-accent" : "border-line",
          )}
        >
          <Image src={url} alt={alt || "Featured image preview"} fill sizes="22rem" className="object-cover" />
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-ink/70">
              <LoaderCircle aria-hidden className="size-6 animate-spin text-gold" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={cn(
            "flex aspect-[1200/630] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors",
            dragging ? "border-accent bg-accent/10" : "border-line hover:border-accent/60 hover:bg-fg/[0.02]",
          )}
        >
          {uploading ? (
            <LoaderCircle aria-hidden className="size-6 animate-spin text-gold" />
          ) : (
            <ImagePlus aria-hidden className="size-6 text-gold" />
          )}
          <span className="text-sm font-semibold text-fg">{uploading ? "Uploading…" : "Upload featured image"}</span>
          <span className="text-xs">Drag & drop or click · JPG, PNG, WebP · max 5 MB · 1200×630 ideal</span>
        </button>
      )}

      {url && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line text-xs font-semibold text-fg transition-colors hover:border-accent/60 hover:text-gold"
          >
            <RefreshCw aria-hidden className="size-3.5" /> Replace
          </button>
          <button
            type="button"
            onClick={() => onUrlChange("")}
            disabled={uploading}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-danger transition-colors hover:border-danger/60 hover:bg-danger/10"
          >
            <Trash2 aria-hidden className="size-3.5" /> Remove
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <FormField id="post-featured_image_alt" label="Image alt text" error={altError} required={Boolean(url)}>
        <input
          id="post-featured_image_alt"
          name="featured_image_alt"
          type="text"
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          onBlur={onAltBlur}
          placeholder="e.g. Ads dashboard showing ROAS growth"
          aria-invalid={altError ? true : undefined}
          aria-describedby={altError ? "post-featured_image_alt-error" : undefined}
          className={inputStyles(Boolean(altError))}
        />
      </FormField>
    </div>
  );
}
