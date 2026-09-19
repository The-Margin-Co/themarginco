import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { CaseStudy, CaseStudySummary } from "@/lib/types";

const SUMMARY_COLUMNS =
  "id, title, slug, excerpt, industry, channels, metrics, featured_image, featured_image_alt, published_at, created_at, updated_at, seo";

export async function getCaseStudies(): Promise<CaseStudySummary[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("case_studies")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Failed to load case studies: ${error.message}`);
  return data;
}

export async function getRecentCaseStudies(limit: number, excludeSlug?: string): Promise<CaseStudySummary[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from("case_studies")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (excludeSlug) query = query.neq("slug", excludeSlug);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to load recent case studies: ${error.message}`);
  return data;
}

export const getCaseStudyBySlug = cache(async (slug: string): Promise<CaseStudy | null> => {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Failed to load case study "${slug}": ${error.message}`);
  return data;
});

export async function getAllCaseStudySlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("case_studies").select("slug").eq("status", "published");
  if (error) throw new Error(`Failed to load case study slugs: ${error.message}`);
  return data.map((row) => row.slug);
}
