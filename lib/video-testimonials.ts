import { createPublicClient } from "@/lib/supabase/public";
import type { VideoTestimonial } from "@/lib/types";

export async function getVideoTestimonials(): Promise<VideoTestimonial[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("video_testimonials")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Failed to load video testimonials: ${error.message}`);
  return data;
}
