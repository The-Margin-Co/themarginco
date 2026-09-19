import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/media";

export function imageFileError(file: File) {
  if (!(file.type in IMAGE_TYPES)) return "Only JPG, PNG, WebP, GIF or AVIF images are allowed.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}

export async function uploadImage(file: File): Promise<string> {
  const problem = imageFileError(file);
  if (problem) throw new Error(problem);

  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed. Please try again.");
  return data.url;
}

export function altFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
