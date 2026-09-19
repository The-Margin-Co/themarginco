"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Click-to-play video hosted in our own Supabase storage bucket. Only the poster image loads on
 * first render (`preload="none"` plus no <video> at all until clicked), so a visitor who never
 * presses play never downloads a single video byte.
 */
export function VideoEmbed({
  videoUrl,
  posterUrl,
  posterAlt,
  title,
}: {
  videoUrl: string;
  posterUrl: string;
  posterAlt: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (playing) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        title={title}
        controls
        autoPlay
        playsInline
        preload="none"
        // The poster button is replaced by this element, so move focus here to keep it with the control.
        onLoadedMetadata={() => videoRef.current?.focus()}
        className="aspect-video w-full bg-ink-2"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden bg-ink-2"
    >
      <Image src={posterUrl} alt={posterAlt} fill sizes="(min-width: 640px) 24rem, 100vw" className="object-cover" />
      <span className="absolute inset-0 bg-ink/20 transition-colors group-hover:bg-ink/35" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent text-on-accent shadow-glow transition-transform group-hover:scale-110">
          <Play aria-hidden className="size-6 translate-x-0.5 fill-current" />
        </span>
      </span>
    </button>
  );
}
