import { Database, Newspaper } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { CtaBand } from "@/components/home/CtaBand";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { Container, Section } from "@/components/ui/Container";
import { getPage, getSite } from "@/lib/cms/load";
import type { BlogContent } from "@/lib/cms/pages/blog";
import { getPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo/page";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function generateMetadata() {
  return pageMetadata("blog");
}

export const revalidate = 60;

const BLOG: Bind = { doc: "blog", path: "" };

export default async function BlogPage() {
  const [posts, { content }, site] = await Promise.all([
    // A database hiccup (or an unmigrated database during the first deploy) should show the empty
    // state, not fail the page or the build.
    getPosts().catch((error: unknown) => {
      console.error(error);
      return [];
    }),
    getPage("blog"),
    getSite(),
  ]);
  const [featured, ...rest] = posts;

  return (
    <>
      <PageJsonLd slug="blog" />
      <EditableSection bind={at(BLOG, "hero")} label="Blog header">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          />
          <Container className="relative pb-12 pt-14 lg:pt-20">
            <CmsHeading bind={at(BLOG, "hero")} value={content.hero} as="h1" />
          </Container>
        </section>
      </EditableSection>

      <Section className="pt-4 sm:pt-6">
        <Container>
          {featured ? (
            <>
              <h2 className="sr-only">Latest articles</h2>
              <BlogCard post={featured} featured />
              {rest.length > 0 && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              configured={isSupabaseConfigured() || process.env.NODE_ENV === "production"}
              copy={content.empty}
            />
          )}
        </Container>
      </Section>

      <EditableSection bind={at(BLOG, "cta")} label="Call-to-action band" visible={content.cta.visible}>
        <CtaBand site={site.content} heading={{ ...content.cta, titleBind: at(BLOG, "cta", "title"), highlightBind: at(BLOG, "cta", "highlight") }} />
      </EditableSection>
    </>
  );
}

function EmptyState({ configured, copy }: { configured: boolean; copy: BlogContent["empty"] }) {
  const Icon = configured ? Newspaper : Database;
  return (
    <div className="card mx-auto max-w-2xl p-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/10 text-gold">
        <Icon aria-hidden className="size-7" />
      </span>
      {configured ? (
        <>
          <EditableText bind={at(BLOG, "empty", "title")} value={copy.title} as="h2" className="mt-6 block text-2xl font-extrabold" />
          <EditableText bind={at(BLOG, "empty", "text")} value={copy.text} as="p" className="mt-3 block leading-relaxed" />
        </>
      ) : (
        <>
          <h2 className="mt-6 text-2xl font-extrabold">Connect Supabase to load posts</h2>
          <p className="mt-3 leading-relaxed">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run the SQL migrations in supabase/migrations.
          </p>
        </>
      )}
    </div>
  );
}
