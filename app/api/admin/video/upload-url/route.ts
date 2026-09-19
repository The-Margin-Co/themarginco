import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { isSameOrigin, jsonError } from "@/lib/http";
import { buildVideoPath, MAX_VIDEO_BYTES, VIDEO_BUCKET, VIDEO_TYPES, type VideoType } from "@/lib/media";

const requestSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim(),
  size: z.number().int().positive(),
});

/**
 * Videos are far too big to stream through a serverless function (Vercel caps request bodies at
 * ~4.5 MB), so the browser uploads straight to Supabase Storage. This route is the gate: it
 * verifies the admin session, picks the object path itself (the client never chooses where to
 * write) and hands back a short-lived signed upload token.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Invalid origin.", 403);

  const session = await getAdminSession();
  if (session.state !== "admin") return jsonError("Your session has expired. Please sign in again.", 401);

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid upload request.", 400);
  const { filename, contentType, size } = parsed.data;

  if (!(contentType in VIDEO_TYPES)) return jsonError("Upload an MP4 or WebM video.", 415);
  if (size > MAX_VIDEO_BYTES) return jsonError("Videos must be 50 MB or smaller.", 413);

  const path = buildVideoPath(filename, contentType as VideoType);
  const { data, error } = await session.supabase.storage.from(VIDEO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("Signed upload URL failed:", error?.message);
    return jsonError("Couldn't start the upload. Please try again.", 500);
  }

  return Response.json({ path: data.path, token: data.token }, { status: 201 });
}
