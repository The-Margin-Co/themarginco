import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";
import { PostSeoEditor } from "@/components/admin/PostSeoEditor";
import { ButtonLink } from "@/components/ui/Button";
import { getStaffSession } from "@/lib/auth";
import { parsePostSeo } from "@/lib/seo/schema";
import { toFormValues } from "@/lib/post-form";
import { updatePost, updatePostSeo } from "../actions";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next={`/admin/blog/${id}`} />;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: post } = await session.supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  const { created } = await searchParams;
  const status = post.status === "published" ? "published" : "draft";
  const seo = parsePostSeo(post.seo);

  if (session.role !== "admin") {
    return (
      <AdminShell
        email={session.user.email ?? ""}
        role={session.role}
        title="Post SEO"
        description={post.title}
        actions={
          <Link href="/admin/blog" className="hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:flex">
            <ArrowLeft aria-hidden className="size-4" /> All posts
          </Link>
        }
      >
        <PostSeoEditor
          action={updatePostSeo.bind(null, post.id)}
          post={{ title: post.title, slug: post.slug, excerpt: post.excerpt, status, featuredImage: post.featured_image ?? "" }}
          initialMeta={{
            meta_title: post.meta_title ?? "",
            meta_description: post.meta_description ?? "",
            meta_keywords: post.meta_keywords ?? "",
          }}
          initialSeo={seo}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="Edit post"
      description={post.title}
      actions={
        <>
          <Link href="/admin/blog" className="hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:flex">
            <ArrowLeft aria-hidden className="size-4" /> All posts
          </Link>
          <ButtonLink href="/admin/blog/new" size="sm" variant="secondary">
            <Plus aria-hidden className="size-4" /> New post
          </ButtonLink>
        </>
      }
    >
      <PostEditor
        mode="edit"
        initial={toFormValues(post)}
        initialStatus={status}
        action={updatePost.bind(null, post.id)}
        notice={created === "1" ? (status === "published" ? "Post published. It's live on the blog." : "Draft created.") : undefined}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        initialSeo={seo}
      />
    </AdminShell>
  );
}
