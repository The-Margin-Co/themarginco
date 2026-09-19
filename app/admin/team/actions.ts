"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession, type StaffRole } from "@/lib/auth";
import type { FormState } from "@/lib/validation";

const ROLES = ["admin", "seo_editor"] as const;

const addSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  role: z.enum(ROLES, { error: "Choose a role." }),
});

function friendly(message: string) {
  return message.replace(/^.*?: /, "");
}

export async function addStaff(_previous: FormState<"email" | "role">, formData: FormData): Promise<FormState<"email" | "role">> {
  const session = await getAdminSession();
  if (session.state !== "admin") return { status: "error", message: "Only admins can manage the team." };

  const parsed = addSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) {
    return { status: "error", message: "Check the form.", fieldErrors: { email: parsed.error.issues[0]?.message } };
  }

  const { error } = await session.supabase.rpc("add_staff", { p_email: parsed.data.email, p_role: parsed.data.role });
  if (error) return { status: "error", message: friendly(error.message) };
  revalidatePath("/admin/team");
  return { status: "success", message: `${parsed.data.email} now has ${parsed.data.role === "admin" ? "admin" : "SEO editor"} access.` };
}

export async function setStaffRole(userId: string, role: StaffRole) {
  const session = await getAdminSession();
  if (session.state !== "admin" || !z.uuid().safeParse(userId).success || !ROLES.includes(role)) return;
  await session.supabase.rpc("set_staff_role", { p_user: userId, p_role: role });
  revalidatePath("/admin/team");
}

export async function removeStaff(userId: string) {
  const session = await getAdminSession();
  if (session.state !== "admin" || !z.uuid().safeParse(userId).success) return;
  await session.supabase.rpc("remove_staff", { p_user: userId });
  revalidatePath("/admin/team");
}
