"use client";

import { LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { useActionState, useTransition } from "react";
import { addStaff, removeStaff, setStaffRole } from "@/app/admin/team/actions";
import { FormBanner, inputStyles } from "@/components/ui/FormField";
import type { StaffRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

type Member = { userId: string; email: string; role: StaffRole; createdAt: string; lastSignInAt: string | null; isYou: boolean };

const ROLE_HELP: Record<StaffRole, string> = {
  admin: "Everything: pages, blog, SEO, settings and team.",
  seo_editor: "SEO only: meta tags, keywords, schema, robots and sitemap.",
};

export function TeamManager({ members }: { members: Member[] }) {
  const [state, formAction, pending] = useActionState(addStaff, { status: "idle" });
  const [busy, startTransition] = useTransition();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {members.map((member) => (
            <li key={member.userId} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid size-10 place-items-center rounded-full bg-accent font-display text-sm font-extrabold text-on-accent">
                {member.email.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fg">
                  {member.email} {member.isYou && <span className="text-xs font-normal text-muted">(you)</span>}
                </p>
                <p className="text-xs">
                  Added {formatDate(member.createdAt)} · {member.lastSignInAt ? `last sign-in ${formatDate(member.lastSignInAt)}` : "never signed in"}
                </p>
              </div>
              <select
                aria-label={`Role for ${member.email}`}
                value={member.role}
                disabled={member.isYou || busy}
                onChange={(event) => startTransition(() => setStaffRole(member.userId, event.target.value as StaffRole))}
                className={inputStyles(false, "w-40 py-2")}
              >
                <option value="admin">Admin</option>
                <option value="seo_editor">SEO editor</option>
              </select>
              <button
                type="button"
                disabled={member.isYou || busy}
                aria-label={`Remove ${member.email}`}
                onClick={() => {
                  if (window.confirm(`Remove ${member.email}'s access to the CMS?`)) startTransition(() => removeStaff(member.userId));
                }}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-30"
              >
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form action={formAction} className="card space-y-4 self-start p-5">
        <h2 className="font-sans text-sm font-semibold text-fg">Add a team member</h2>
        {state.status !== "idle" && state.message && <FormBanner tone={state.status === "success" ? "success" : "error"}>{state.message}</FormBanner>}
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-fg">Email</span>
          <input name="email" type="email" required placeholder="name@company.com" className={inputStyles(Boolean(state.fieldErrors?.email), "py-2.5")} />
          {state.fieldErrors?.email && <span className="mt-1 block text-xs text-danger">{state.fieldErrors.email}</span>}
        </label>
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium text-fg">Role</legend>
          {(["seo_editor", "admin"] as StaffRole[]).map((role) => (
            <label key={role} className="flex cursor-pointer gap-3 rounded-xl border border-line p-3 has-[:checked]:border-accent has-[:checked]:bg-accent/10">
              <input type="radio" name="role" value={role} defaultChecked={role === "seo_editor"} className="mt-1 accent-accent" />
              <span>
                <span className="block text-sm font-semibold text-fg">{role === "admin" ? "Admin" : "SEO editor"}</span>
                <span className="text-xs">{ROLE_HELP[role]}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <button type="submit" disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-on-accent hover:bg-accent-2 disabled:opacity-60">
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Give access
        </button>
        <p className="text-xs leading-relaxed text-zinc-500">
          The person needs an account first: create it in Supabase → Authentication → Users (turn public sign-ups off), then add their email here.
        </p>
      </form>
    </div>
  );
}
