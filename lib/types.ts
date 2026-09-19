import type { Tables } from "@/lib/database.types";

export type Post = Tables<"posts">;

export type PostSummary = Pick<
  Post,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "category"
  | "featured_image"
  | "featured_image_alt"
  | "published_at"
  | "created_at"
  | "updated_at"
  | "seo"
>;

export type AdminPostRow = Pick<
  Post,
  "id" | "title" | "slug" | "category" | "status" | "featured_image" | "published_at" | "updated_at"
>;

export type CaseStudyMetric = { value: string; label: string; detail?: string };

export type CaseStudy = Tables<"case_studies">;

export type CaseStudySummary = Pick<
  CaseStudy,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "industry"
  | "channels"
  | "metrics"
  | "featured_image"
  | "featured_image_alt"
  | "published_at"
  | "created_at"
  | "updated_at"
  | "seo"
>;

export type AdminCaseStudyRow = Pick<
  CaseStudy,
  "id" | "title" | "slug" | "industry" | "status" | "featured_image" | "published_at" | "updated_at"
>;

export type Lead = Tables<"leads">;

export type VideoTestimonial = Tables<"video_testimonials">;
