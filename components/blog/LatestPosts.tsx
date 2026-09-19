import { ArrowRight } from "lucide-react";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import type { HomeContent } from "@/lib/cms/pages/home";
import { getRecentPosts } from "@/lib/posts";
import { BlogCard } from "./BlogCard";

export async function LatestPosts({ bind, content }: { bind: Bind; content: HomeContent["insights"] }) {
  const posts = await getRecentPosts(3).catch((error: unknown) => {
    console.error(error);
    return [];
  });
  if (posts.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <CmsHeading bind={bind} value={content} align="left" />
          <ButtonLink href="/blog" variant="secondary">
            <EditableText bind={at(bind, "buttonLabel")} value={content.buttonLabel} />
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
