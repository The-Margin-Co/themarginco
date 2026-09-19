import {
  ArrowRight,
  ChartColumn,
  CodeXml,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { PostSummary } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  "Meta Ads": Megaphone,
  "Facebook Ads": Users,
  "Web Development": CodeXml,
  "Growth Strategy": TrendingUp,
  "Case Studies": ChartColumn,
};

export function BlogCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  const Icon = categoryIcons[post.category] ?? Sparkles;

  return (
    <article
      className={cn(
        "group card relative flex overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent",
        featured ? "flex-col lg:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative grid aspect-[1200/630] place-items-center overflow-hidden border-b border-line bg-ink-2",
          featured && "lg:aspect-auto lg:min-h-80 lg:w-1/2 lg:border-b-0 lg:border-r",
        )}
      >
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.featured_image_alt ?? ""}
            fill
            sizes={featured ? "(min-width: 1024px) 40rem, 100vw" : "(min-width: 768px) 24rem, 100vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-grid opacity-70" />
            <div aria-hidden className="absolute size-44 rounded-full bg-accent/15 blur-3xl transition-colors duration-500 group-hover:bg-accent/30" />
            <span
              aria-hidden
              className={cn(
                "relative grid place-items-center rounded-2xl border border-accent/40 bg-accent/10 text-gold transition duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent",
                featured ? "size-20" : "size-14",
              )}
            >
              <Icon className={featured ? "size-9" : "size-6"} />
            </span>
          </>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:justify-center lg:p-10")}>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Badge>{post.category}</Badge>
          <time dateTime={post.published_at ?? post.created_at}>{formatDate(post.published_at ?? post.created_at)}</time>
        </div>
        <h3
          className={cn(
            "mt-4 text-balance font-bold tracking-tight",
            featured ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className={cn("mt-3 text-sm leading-relaxed", !featured && "line-clamp-3")}>{post.excerpt}</p>
        <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-gold">
          Read article
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
