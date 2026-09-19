import { LogOut, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormField";
import type { AdminSession, StaffSession } from "@/lib/auth";

export function AdminAccessState({
  session,
  next,
}: {
  session: Exclude<AdminSession, { state: "admin" }> | Exclude<StaffSession, { state: "staff" }>;
  next: string;
}) {
  if (session.state === "signed-out") redirect(`/admin/login?next=${encodeURIComponent(next)}`);

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      {session.state === "unconfigured" ? (
        <div className="max-w-lg">
          <FormBanner tone="info">
            Supabase isn&apos;t configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> and restart the dev server.
          </FormBanner>
        </div>
      ) : (
        <div className="card w-full max-w-md p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger/10 text-danger">
            <ShieldAlert aria-hidden className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-extrabold">No access</h1>
          <p className="mt-2 text-sm">{session.user.email} is signed in but doesn&apos;t have access to this area.</p>
          <form action={signOut} className="mt-6">
            <Button type="submit" variant="secondary">
              <LogOut aria-hidden className="size-4" /> Sign out
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
