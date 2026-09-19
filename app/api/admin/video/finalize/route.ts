import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { isSameOrigin, jsonError } from "@/lib/http";
import { MAX_VIDEO_BYTES, sniffVideoType, VIDEO_BUCKET, videoUrlPrefix } from "@/lib/media";

const requestSchema = z.object({ path: z.string().trim().min(1).max(300) });

/**
 * The bucket's MIME allowlist only checks the *declared* content type, so a renamed file would
 * sail through the direct upload. After the browser finishes, this route reads the first bytes
 * back and deletes the object unless they really are a video.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Invalid origin.", 403);

  const session = await getAdminSession();
  if (session.state !== "admin") return jsonError("Your session has expired. Please sign in again.", 401);

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid request.", 400);
  const path = parsed.data.path;
  if (path.includes("..") || path.startsWith("/")) return jsonError("Invalid path.", 400);

  const prefix = videoUrlPrefix();
  if (!prefix) return jsonError("Storage isn't configured.", 500);

  const storage = session.supabase.storage.from(VIDEO_BUCKET);
  const discard = async () => {
    await storage.remove([path]).catch(() => undefined);
  };

  const head = await fetch(`${prefix}${path}`, { headers: { Range: "bytes=0-15" }, cache: "no-store" }).catch(() => null);
  if (!head || !head.ok) {
    await discard();
    return jsonError("The upload didn't finish. Please try again.", 400);
  }

  const total = Number(head.headers.get("content-range")?.split("/")[1] ?? head.headers.get("content-length") ?? 0);
  if (total > MAX_VIDEO_BYTES) {
    await discard();
    return jsonError("Videos must be 50 MB or smaller.", 413);
  }

  const bytes = new Uint8Array(await head.arrayBuffer());
  if (!sniffVideoType(bytes)) {
    await discard();
    return jsonError("That file isn't a valid MP4 or WebM video.", 415);
  }

  return Response.json({ url: `${prefix}${path}`, path }, { status: 200 });
}
