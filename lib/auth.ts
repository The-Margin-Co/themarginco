import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DEFAULT_ADMIN_PATH = "/admin/pages";

export type StaffRole = "admin" | "seo_editor";

// Only same-site /admin paths are allowed, which rules out open redirects via ?next=.
export function safeAdminPath(value: unknown) {
  if (typeof value !== "string") return DEFAULT_ADMIN_PATH;
  if (!value.startsWith("/admin/") || value.startsWith("/admin/login")) return DEFAULT_ADMIN_PATH;
  if (value.includes("..") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return DEFAULT_ADMIN_PATH;
  return value;
}

/** Any signed-in team member (admin or SEO editor). Cached per request. */
export const getStaffSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { state: "unconfigured" } as const;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "signed-out" } as const;

  const { data: role, error } = await supabase.rpc("staff_role");
  if (error || (role !== "admin" && role !== "seo_editor")) return { state: "forbidden", user } as const;

  return { state: "staff", role: role as StaffRole, user, supabase } as const;
});

/** Admin-only session; SEO editors are treated as forbidden. */
export async function getAdminSession() {
  const session = await getStaffSession();
  if (session.state !== "staff") return session;
  if (session.role !== "admin") return { state: "forbidden", user: session.user } as const;
  return { state: "admin", user: session.user, supabase: session.supabase } as const;
}

export type StaffSession = Awaited<ReturnType<typeof getStaffSession>>;
export type AdminSession = Awaited<ReturnType<typeof getAdminSession>>;
