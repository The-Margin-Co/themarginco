"use client";

import { ImagePlus, LoaderCircle, Trash2, Type } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { IMAGE_ACCEPT } from "@/lib/media";
import { altFromFilename, uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";
import type { Bind } from "./Editable";
import { resolveValue, useEditMode } from "./edit/store";

/** Image slot with in-place replace/remove and alt text, backed by the media bucket. */
export function InlineImage({
  bind,
  altBind,
  src,
  alt,
  sizes,
  className,
  frameClassName,
}: {
  bind: Bind;
  altBind: Bind;
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  frameClassName?: string;
}) {
  const edit = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState(false);

  const currentSrc = edit ? resolveValue(edit.patches, bind, src) : src;
  const currentAlt = edit ? resolveValue(edit.patches, altBind, alt) : alt;

  async function replace(file: File | undefined) {
    if (!file || !edit) return;
    setUploading(true);
    setProblem(null);
    try {
      const url = await uploadImage(file);
      edit.setValue(bind, url, src);
      if (!currentAlt) edit.setValue(altBind, altFromFilename(file.name), alt);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const button =
    "flex h-9 items-center gap-1.5 rounded-full bg-ink/85 px-3 text-xs font-semibold text-fg shadow-lg backdrop-blur hover:bg-accent hover:text-on-accent";

  return (
    <div className={cn("group/image relative", frameClassName)}>
      {currentSrc ? (
        <Image src={currentSrc} alt={currentAlt} fill sizes={sizes} className={className} />
      ) : (
        <div className="absolute inset-0 grid place-items-center border-2 border-dashed border-accent/40 bg-accent/[0.04] text-sm font-semibold text-gold">
          No image. Visitors won&apos;t see this block.
        </div>
      )}

      {edit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              void replace(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <div className="absolute inset-x-3 top-3 flex flex-wrap justify-end gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover/image:opacity-100">
            <button type="button" className={button} onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <LoaderCircle className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              {currentSrc ? "Replace" : "Upload image"}
            </button>
            {currentSrc && (
              <>
                <button type="button" className={button} onClick={() => setEditingAlt((open) => !open)}>
                  <Type className="size-3.5" /> Alt text
                </button>
                <button type="button" aria-label="Remove image" className={button} onClick={() => edit.setValue(bind, "", src)}>
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>

          {(editingAlt || problem || (currentSrc && !currentAlt)) && (
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-ink/90 p-3 shadow-xl backdrop-blur">
              {problem && <p className="mb-2 text-xs text-danger">{problem}</p>}
              {currentSrc && (
                <label className="block text-xs font-semibold text-fg">
                  Alt text {!currentAlt && <span className="font-normal text-danger">(required for accessibility and SEO)</span>}
                  <input
                    value={currentAlt}
                    maxLength={160}
                    onChange={(event) => edit.setValue(altBind, event.target.value, alt)}
                    placeholder="Describe the image"
                    className="mt-1.5 h-9 w-full rounded-lg border border-line bg-charcoal px-3 text-sm font-normal text-fg focus:border-accent focus:outline-none"
                  />
                </label>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
