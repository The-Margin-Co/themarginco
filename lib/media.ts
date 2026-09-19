export const MEDIA_BUCKET = "media";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const VIDEO_BUCKET = "videos";
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;

export const VIDEO_TYPES = {
  "video/mp4": "mp4",
  "video/webm": "webm",
} as const;

export type ImageType = keyof typeof IMAGE_TYPES;
export type VideoType = keyof typeof VIDEO_TYPES;

export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");
export const VIDEO_ACCEPT = Object.keys(VIDEO_TYPES).join(",");

function bucketUrlPrefix(bucket: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/` : null;
}

export function mediaUrlPrefix() {
  return bucketUrlPrefix(MEDIA_BUCKET);
}

export function videoUrlPrefix() {
  return bucketUrlPrefix(VIDEO_BUCKET);
}

function isBucketUrl(url: string, prefix: string | null) {
  return prefix !== null && url.startsWith(prefix) && !url.includes("..");
}

export function isMediaUrl(url: string) {
  return isBucketUrl(url, mediaUrlPrefix());
}

export function isVideoUrl(url: string) {
  return isBucketUrl(url, videoUrlPrefix());
}

/** Object path inside the videos bucket for a public video URL, or null if it isn't one of ours. */
export function videoPathFromUrl(url: string) {
  const prefix = videoUrlPrefix();
  return prefix !== null && isVideoUrl(url) ? url.slice(prefix.length) : null;
}

/** Object path inside the media bucket for a public image URL, or null if it isn't one of ours. */
export function mediaPathFromUrl(url: string) {
  const prefix = mediaUrlPrefix();
  return prefix !== null && isMediaUrl(url) ? url.slice(prefix.length) : null;
}

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

// Trust the file's bytes, not the browser-supplied MIME type.
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG") return "image/png";
  if (ascii(bytes, 0, 4) === "GIF8") return "image/gif";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  if (ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "image/avif";
  return null;
}

// MP4: an `ftyp` box at byte 4 whose brand isn't an AVIF still-image brand.
// WebM/Matroska: the EBML header 1A 45 DF A3. QuickTime (.mov, brand "qt  ") is rejected on purpose:
// browsers don't reliably play it, so admins are told to export MP4.
export function sniffVideoType(bytes: Uint8Array): VideoType | null {
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "video/webm";
  if (ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12);
    if (brand !== "avif" && brand !== "avis" && brand !== "heic" && brand !== "heix" && brand !== "qt  ") return "video/mp4";
  }
  return null;
}

/** Unique, server-chosen object path: `<prefix>/YYYY/MM/<timestamp>-<random>-<slug>.<ext>`. */
export function buildObjectPath(originalName: string, extension: string, prefix: string, fallbackName = "file") {
  const now = new Date();
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || fallbackName;
  const random = Math.random().toString(36).slice(2, 8);
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${prefix}/${now.getUTCFullYear()}/${month}/${Date.now()}-${random}-${base}.${extension}`;
}

export function buildMediaPath(originalName: string, type: ImageType) {
  return buildObjectPath(originalName, IMAGE_TYPES[type], "blog", "image");
}

export function buildVideoPath(originalName: string, type: VideoType) {
  return buildObjectPath(originalName, VIDEO_TYPES[type], "testimonials", "video");
}
