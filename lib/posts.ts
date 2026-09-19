import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Post, PostSummary } from "@/lib/types";

const SUMMARY_COLUMNS =
  "id, title, slug, excerpt, category, featured_image, featured_image_alt, published_at, created_at, updated_at, seo";

export async function getPosts(): Promise<PostSummary[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return data;
}

export async function getRecentPosts(limit: number, excludeSlug?: string): Promise<PostSummary[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (excludeSlug) query = query.neq("slug", excludeSlug);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to load recent posts: ${error.message}`);
  return data;
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Failed to load post "${slug}": ${error.message}`);
  return data;
});

export async function getAllSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("posts").select("slug").eq("status", "published");
  if (error) throw new Error(`Failed to load post slugs: ${error.message}`);
  return data.map((row) => row.slug);
}
