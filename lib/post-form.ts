import type { Post } from "@/lib/types";
import type { PostField } from "@/lib/validation";

export type PostFormValues = Record<Exclude<PostField, "status">, string>;

export const EMPTY_POST: PostFormValues = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  content: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  featured_image: "",
  featured_image_alt: "",
};

export function toFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
    meta_keywords: post.meta_keywords ?? "",
    featured_image: post.featured_image ?? "",
    featured_image_alt: post.featured_image_alt ?? "",
  };
}
