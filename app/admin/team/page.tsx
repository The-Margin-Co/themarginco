import type { Metadata } from "next";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { TeamManager } from "@/components/admin/TeamManager";
import { getAdminSession } from "@/lib/auth";
import type { StaffRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/team" />;

  const { data, error } = await session.supabase.rpc("list_staff");
  if (error) throw new Error(`Failed to load team: ${error.message}`);

  return (
    <AdminShell email={session.user.email ?? ""} role="admin" title="Team" description="Who can sign in to the CMS, and what they can change.">
      <TeamManager
        members={data.map((member) => ({
          userId: member.user_id,
          email: member.email,
          role: member.role as StaffRole,
          createdAt: member.created_at,
          lastSignInAt: member.last_sign_in_at,
          isYou: member.user_id === session.user.id,
        }))}
      />
    </AdminShell>
  );
}
