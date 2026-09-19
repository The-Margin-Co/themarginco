import { createClient } from "@supabase/supabase-js";
import { MAX_VIDEO_BYTES, VIDEO_BUCKET, VIDEO_TYPES } from "@/lib/media";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function videoFileError(file: File) {
  if (!(file.type in VIDEO_TYPES)) return "Only MP4 or WebM videos are allowed. Export as MP4 if you're unsure.";
  if (file.size > MAX_VIDEO_BYTES) return "Videos must be 50 MB or smaller. Compress it and try again.";
  return null;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Upload failed. Please try again.");
  return data;
}

/**
 * Three steps, because the file itself must not pass through the Next.js server:
 * ask the server for a signed upload token, PUT the file straight to Supabase Storage,
 * then have the server read the first bytes back and verify it really is a video.
 */
export async function uploadVideo(file: File): Promise<string> {
  const problem = videoFileError(file);
  if (problem) throw new Error(problem);

  const env = getSupabaseEnv();
  if (!env) throw new Error("Storage isn't configured.");

  const { path, token } = await post<{ path: string; token: string }>("/api/admin/video/upload-url", {
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  const storage = createClient(env.url, env.anonKey, { auth: { persistSession: false } }).storage.from(VIDEO_BUCKET);
  const { error } = await storage.uploadToSignedUrl(path, token, file, {
    contentType: file.type,
    // Paths carry a timestamp and random suffix, so a replacement always gets a new URL.
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message || "Upload failed. Please try again.");

  const { url } = await post<{ url: string }>("/api/admin/video/finalize", { path });
  return url;
}

/** Grabs a frame from a local video file so the admin doesn't have to make a poster by hand. */
export function posterFromVideo(file: File, seekSeconds = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    const fail = (message: string) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(message));
    };

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekSeconds, Math.max(0, video.duration - 0.1));
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return fail("Couldn't read the video frame.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) return reject(new Error("Couldn't create a poster image."));
        resolve(new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-poster.jpg`, { type: "image/jpeg" }));
      }, "image/jpeg", 0.85);
    };
    video.onerror = () => fail("Couldn't read that video.");
    video.src = objectUrl;
  });
}
