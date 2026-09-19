import { describe, expect, it } from "vitest";
import {
  buildMediaPath,
  buildVideoPath,
  isMediaUrl,
  isVideoUrl,
  sniffImageType,
  sniffVideoType,
  videoPathFromUrl,
} from "@/lib/media";

const bytes = (...values: number[]) => new Uint8Array(values);
const withAscii = (offset: number, text: string, total = 16) => {
  const out = new Uint8Array(total);
  [...text].forEach((char, i) => (out[offset + i] = char.charCodeAt(0)));
  return out;
};

describe("sniffVideoType", () => {
  it("recognises an MP4 by its ftyp box", () => {
    expect(sniffVideoType(withAscii(4, "ftypisom"))).toBe("video/mp4");
    expect(sniffVideoType(withAscii(4, "ftypmp42"))).toBe("video/mp4");
  });
  it("recognises WebM by its EBML header", () => {
    expect(sniffVideoType(bytes(0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0))).toBe("video/webm");
  });
  it("does not mistake AVIF/HEIC stills or QuickTime for an MP4", () => {
    expect(sniffVideoType(withAscii(4, "ftypavif"))).toBeNull();
    expect(sniffVideoType(withAscii(4, "ftypheic"))).toBeNull();
    expect(sniffVideoType(withAscii(4, "ftypqt  "))).toBeNull();
  });
  it("rejects renamed non-video files", () => {
    expect(sniffVideoType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0))).toBeNull(); // a JPEG
    expect(sniffVideoType(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
    expect(sniffVideoType(new Uint8Array(0))).toBeNull();
  });
});

describe("sniffImageType", () => {
  it("identifies images by bytes and still treats AVIF as an image", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffImageType(withAscii(4, "ftypavif"))).toBe("image/avif");
    expect(sniffImageType(withAscii(4, "ftypisom"))).toBeNull();
  });
});

describe("bucket URL checks", () => {
  const base = "https://example.supabase.co/storage/v1/object/public";
  it("only accepts URLs inside the right bucket", () => {
    expect(isVideoUrl(`${base}/videos/testimonials/2026/09/a.mp4`)).toBe(true);
    expect(isVideoUrl(`${base}/media/blog/a.jpg`)).toBe(false);
    expect(isMediaUrl(`${base}/media/blog/a.jpg`)).toBe(true);
    expect(isMediaUrl(`${base}/videos/a.mp4`)).toBe(false);
  });
  it("rejects other hosts and path traversal", () => {
    expect(isVideoUrl("https://evil.example/storage/v1/object/public/videos/a.mp4")).toBe(false);
    expect(isVideoUrl(`${base}/videos/../media/a.mp4`)).toBe(false);
    expect(isVideoUrl("https://www.youtube.com/watch?v=abc")).toBe(false);
  });
  it("maps a public URL back to its object path", () => {
    expect(videoPathFromUrl(`${base}/videos/testimonials/2026/09/a.mp4`)).toBe("testimonials/2026/09/a.mp4");
    expect(videoPathFromUrl("https://elsewhere.example/a.mp4")).toBeNull();
  });
});

describe("object paths", () => {
  it("are server-chosen, slugged and unique", () => {
    const a = buildVideoPath("My Client Video!!.MP4", "video/mp4");
    const b = buildVideoPath("My Client Video!!.MP4", "video/mp4");
    expect(a).toMatch(/^testimonials\/\d{4}\/\d{2}\/\d+-[a-z0-9]+-my-client-video\.mp4$/);
    expect(a).not.toBe(b);
  });
  it("neutralise traversal and odd characters in the file name", () => {
    const path = buildMediaPath("../../etc/passwd.png", "image/png");
    expect(path).not.toContain("..");
    expect(path.startsWith("blog/")).toBe(true);
  });
});
