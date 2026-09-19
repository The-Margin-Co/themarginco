"use client";

import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { VIDEO_ACCEPT } from "@/lib/media";
import { uploadImage } from "@/lib/upload-image";
import { posterFromVideo, uploadVideo, videoFileError } from "@/lib/upload-video";
import { cn } from "@/lib/utils";

export function VideoUploadField({
  url,
  error,
  onUrlChange,
  onPosterCaptured,
}: {
  url: string;
  error?: string | null;
  onUrlChange: (url: string) => void;
  /** Offered after an upload so the admin doesn't have to make a poster image by hand. */
  onPosterCaptured: (posterUrl: string, suggestedAlt: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [posterBusy, setPosterBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = videoFileError(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      onUrlChange(await uploadVideo(file));
      setLastFile(file);
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function capturePoster() {
    if (!lastFile) return;
    setPosterBusy(true);
    setUploadError(null);
    try {
      const poster = await posterFromVideo(lastFile);
      onPosterCaptured(await uploadImage(poster), lastFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (posterFailure) {
      setUploadError(posterFailure instanceof Error ? posterFailure.message : "Couldn't create a poster.");
    } finally {
      setPosterBusy(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  const shown = uploadError ?? error;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {url ? (
        <div className="overflow-hidden rounded-xl border border-line bg-ink">
          <video src={url} controls playsInline preload="metadata" className="aspect-video w-full bg-ink-2" />
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
            "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors",
            dragging ? "border-accent bg-accent/10" : "border-line hover:border-accent/60 hover:bg-fg/[0.02]",
          )}
        >
          {uploading ? (
            <LoaderCircle aria-hidden className="size-6 animate-spin text-gold" />
          ) : (
            <Upload aria-hidden className="size-6 text-gold" />
          )}
          <span className="text-sm font-semibold text-fg">{uploading ? "Uploading…" : "Upload video"}</span>
          <span className="text-xs">Drag &amp; drop or click · MP4 or WebM · max 50 MB</span>
        </button>
      )}

      {url && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || posterBusy}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line text-xs font-semibold text-fg transition-colors hover:border-accent/60 hover:text-gold"
          >
            {uploading ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : <Upload aria-hidden className="size-3.5" />}
            Replace
          </button>
          {lastFile && (
            <button
              type="button"
              onClick={() => void capturePoster()}
              disabled={posterBusy || uploading}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg transition-colors hover:border-accent/60 hover:text-gold"
            >
              {posterBusy ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : <ImagePlus aria-hidden className="size-3.5" />}
              Use a frame as the poster
            </button>
          )}
          <button
            type="button"
            onClick={() => onUrlChange("")}
            disabled={uploading || posterBusy}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-danger transition-colors hover:border-danger/60 hover:bg-danger/10"
          >
            <Trash2 aria-hidden className="size-3.5" /> Remove
          </button>
        </div>
      )}

      {shown && (
        <p role="alert" className="text-sm text-danger">
          {shown}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        Videos are hosted on your own Supabase storage. Compress before uploading: 720p MP4, roughly 15–25 MB a minute.
      </p>
    </div>
  );
}
