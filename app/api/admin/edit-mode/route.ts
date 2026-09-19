import { draftMode } from "next/headers";
import { getStaffSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";

/** Only same-site public paths: no protocol-relative URLs, no admin routes. */
function safePublicPath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return "/";
  if (path.includes("..") || /[\u0000-\u001f]/.test(path)) return "/";
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/")) return "/";
  return path;
}

function redirectTo(request: Request, path: string) {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

/**
 * Turns the inline editor on (mode=enter) or off (mode=exit) with Next's Draft Mode cookie.
 * Entering requires a staff session; the editing UI re-checks the session on every render.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Invalid origin.", { status: 403 });

  const form = await request.formData().catch(() => new FormData());
  const path = safePublicPath(form.get("path"));
  const draft = await draftMode();

  if (form.get("mode") === "exit") {
    draft.disable();
    return redirectTo(request, path);
  }

  const session = await getStaffSession();
  if (session.state !== "staff") return redirectTo(request, "/admin/login");

  draft.enable();
  return redirectTo(request, path);
}
