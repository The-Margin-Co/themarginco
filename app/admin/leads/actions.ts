"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";

const leadId = z.uuid();

export async function toggleLeadHandled(id: string, handled: boolean) {
  const session = await getAdminSession();
  if (session.state !== "admin") throw new Error("Not authorized");
  const parsedId = leadId.parse(id);

  const { error } = await session.supabase.from("leads").update({ handled }).eq("id", parsedId);
  if (error) throw new Error(`Failed to update lead: ${error.message}`);
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  const session = await getAdminSession();
  if (session.state !== "admin") throw new Error("Not authorized");
  const parsedId = leadId.parse(id);

  const { error } = await session.supabase.from("leads").delete().eq("id", parsedId);
  if (error) throw new Error(`Failed to delete lead: ${error.message}`);
  revalidatePath("/admin/leads");
}
