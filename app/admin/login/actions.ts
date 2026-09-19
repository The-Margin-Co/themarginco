"use server";

import { redirect } from "next/navigation";
import { safeAdminPath } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/validation";

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeAdminPath(formData.get("next"));

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Supabase isn't configured. Add the environment variables first." };
  }

  // The same message for both failures: a different one for "valid password, no CMS access"
  // would confirm working credentials to anyone guessing.
  const denied: FormState = { status: "error", message: "Invalid email or password." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return denied;

  const { data: role, error: roleError } = await supabase.rpc("staff_role");
  if (roleError || !role) {
    await supabase.auth.signOut();
    return denied;
  }

  redirect(role === "admin" ? next : "/admin/pages");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
