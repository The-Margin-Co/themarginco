"use server";

import { getSite } from "@/lib/cms/load";
import { createPublicClient } from "@/lib/supabase/public";
import { leadSchema, toFieldErrors, type FormState, type LeadField } from "@/lib/validation";

export async function submitLead(
  _previous: FormState<LeadField>,
  formData: FormData,
): Promise<FormState<LeadField>> {
  // Honeypot: real visitors never see this field, so pretend success and drop the bot.
  if (formData.get("company_website")) return { status: "success" };

  const parsed = leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    service: String(formData.get("service") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors<LeadField>(parsed.error),
    };
  }

  const { email } = (await getSite()).content.contact;
  const supabase = createPublicClient();
  if (!supabase) {
    console.error("Lead form: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.");
    return {
      status: "error",
      message: `Our form is temporarily unavailable. Please email us at ${email}.`,
    };
  }

  // Goes through submit_lead() rather than a direct insert: anon has no INSERT on the table,
  // so the function's per-email and site-wide hourly limits can't be bypassed.
  const { error } = await supabase.rpc("submit_lead", {
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_service: parsed.data.service,
    p_message: parsed.data.message,
  });
  if (error) {
    console.error("Lead insert failed:", error.message);
    return {
      status: "error",
      message:
        error.code === "P0001"
          ? `We've had a lot of submissions in the last hour. Please email us at ${email}.`
          : `Something went wrong on our side. Please try again or email ${email}.`,
    };
  }

  return { status: "success" };
}
