import { getAdminSession } from "@/lib/auth";
import { isSameOrigin, jsonError as fail } from "@/lib/http";
import { buildMediaPath, MAX_IMAGE_BYTES, MEDIA_BUCKET, sniffImageType } from "@/lib/media";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("Invalid origin.", 403);

  const session = await getAdminSession();
  if (session.state !== "admin") return fail("Your session has expired. Please sign in again.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Upload a single image file.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image to upload.", 400);
  if (file.size > MAX_IMAGE_BYTES) return fail("Images must be 5 MB or smaller.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return fail("Only JPG, PNG, WebP, GIF or AVIF images are allowed.", 415);

  const path = buildMediaPath(file.name, type);
  const storage = session.supabase.storage.from(MEDIA_BUCKET);
  const { error } = await storage.upload(path, bytes, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("Media upload failed:", error.message);
    return fail("Upload failed. Please try again.", 500);
  }

  return Response.json({ url: storage.getPublicUrl(path).data.publicUrl, path }, { status: 201 });
}
