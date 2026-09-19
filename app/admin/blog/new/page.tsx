import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";
import { getAdminSession } from "@/lib/auth";
import { EMPTY_POST } from "@/lib/post-form";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/blog/new" />;

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="New post"
      description="Write, optimise and publish a new article."
      actions={
        <Link href="/admin/blog" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All posts
        </Link>
      }
    >
      <PostEditor mode="create" initial={EMPTY_POST} initialStatus="draft" action={createPost} />
    </AdminShell>
  );
}
