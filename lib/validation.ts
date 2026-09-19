import { z } from "zod";
import { isMediaUrl, isVideoUrl } from "@/lib/media";
import { htmlToPlainText } from "@/lib/utils";

export type FormState<Field extends string = string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
};

export function toFieldErrors<Field extends string>(error: z.ZodError) {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: Partial<Record<Field, string>> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) result[key as Field] = messages[0];
  }
  return result;
}

export const SERVICE_OPTIONS = [
  { value: "meta-ads", label: "Meta Ads" },
  { value: "facebook-ads", label: "Facebook Ads" },
  { value: "website-development", label: "Website Development" },
  { value: "not-sure", label: "Not sure yet, advise me" },
] as const;

export type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"];

const serviceValues = SERVICE_OPTIONS.map((option) => option.value) as [
  ServiceValue,
  ...ServiceValue[],
];

export function isServiceValue(value: unknown): value is ServiceValue {
  return typeof value === "string" && (serviceValues as string[]).includes(value);
}

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long.")
    .pipe(z.email("Enter a valid email address.")),
  service: z.enum(serviceValues, { error: "Choose the service you're interested in." }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(5000, "Message must be 5,000 characters or fewer."),
});

export type LeadField = keyof z.infer<typeof leadSchema>;

export const POST_CATEGORIES = [
  "Meta Ads",
  "Facebook Ads",
  "Web Development",
  "Growth Strategy",
  "Case Studies",
] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const SEO_LIMITS = { metaTitle: 60, metaDescription: 160 } as const;

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

const sharedPostFields = {
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(160, "Title must be 160 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(120, "Slug must be 120 characters or fewer.")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens only."),
  status: z.enum(POST_STATUSES, { error: "Choose draft or published." }),
  meta_title: optionalText(70, "Keep the meta title under 70 characters."),
  meta_description: optionalText(170, "Keep the meta description under 170 characters."),
  meta_keywords: optionalText(255, "Keywords must be 255 characters or fewer."),
  featured_image: z
    .string()
    .trim()
    .refine((url) => url === "" || isMediaUrl(url), "Upload the image with the uploader.")
    .transform((url) => url || null),
  featured_image_alt: optionalText(200, "Alt text must be 200 characters or fewer."),
};

function requireAltText(post: { featured_image: string | null; featured_image_alt: string | null }, ctx: z.RefinementCtx) {
  if (post.featured_image && !post.featured_image_alt) {
    ctx.addIssue({ code: "custom", path: ["featured_image_alt"], message: "Describe the image for accessibility and SEO." });
  }
}

// Drafts can be saved half-finished; publishing enforces the full set of rules.
export const draftPostSchema = z
  .object({
    ...sharedPostFields,
    category: z.union([z.enum(POST_CATEGORIES), z.literal("")], { error: "Choose a category." }),
    excerpt: z.string().trim().max(300, "Excerpt must be 300 characters or fewer."),
    content: z.string().max(200_000, "Content is too long."),
  })
  .superRefine(requireAltText);

export const publishPostSchema = z
  .object({
    ...sharedPostFields,
    category: z.enum(POST_CATEGORIES, { error: "Choose a category before publishing." }),
    excerpt: z
      .string()
      .trim()
      .min(10, "Add an excerpt (at least 10 characters) before publishing.")
      .max(300, "Excerpt must be 300 characters or fewer."),
    content: z
      .string()
      .max(200_000, "Content is too long.")
      .refine((html) => htmlToPlainText(html).length >= 50, "Write at least a couple of sentences (50+ characters) before publishing."),
  })
  .superRefine(requireAltText);

export function postSchemaFor(status: string) {
  return status === "published" ? publishPostSchema : draftPostSchema;
}

export type PostInput = z.input<typeof publishPostSchema>;
export type PostField = keyof PostInput;

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

export const caseStudyMetricSchema = z.object({
  value: z.string().trim().max(12, "Keep the value under 12 characters."),
  label: z.string().trim().max(30, "Keep the label under 30 characters."),
  detail: z.string().trim().max(30, "Keep the detail under 30 characters.").optional(),
});

export const caseStudyMetricsSchema = z.array(caseStudyMetricSchema).max(6, "Add up to 6 metrics.");

const sharedCaseStudyFields = {
  title: sharedPostFields.title,
  slug: sharedPostFields.slug,
  status: sharedPostFields.status,
  channels: optionalText(80, "Channels must be 80 characters or fewer."),
  meta_title: sharedPostFields.meta_title,
  meta_description: sharedPostFields.meta_description,
  meta_keywords: sharedPostFields.meta_keywords,
  featured_image: sharedPostFields.featured_image,
  featured_image_alt: sharedPostFields.featured_image_alt,
};

function parseMetricsField(raw: string, ctx: z.RefinementCtx) {
  try {
    const parsed = JSON.parse(raw || "[]");
    const result = caseStudyMetricsSchema.safeParse(parsed);
    if (!result.success) {
      ctx.addIssue({ code: "custom", path: ["metrics"], message: "Some metrics need attention." });
      return [];
    }
    return result.data;
  } catch {
    ctx.addIssue({ code: "custom", path: ["metrics"], message: "Metrics couldn't be read. Reload and try again." });
    return [];
  }
}

// Drafts can be saved half-finished; publishing enforces the full set of rules.
export const draftCaseStudySchema = z
  .object({
    ...sharedCaseStudyFields,
    industry: z.string().trim().max(40, "Industry must be 40 characters or fewer."),
    excerpt: z.string().trim().max(300, "Excerpt must be 300 characters or fewer."),
    content: z.string().max(200_000, "Content is too long."),
    metrics: z.string().transform(parseMetricsField),
  })
  .superRefine(requireAltText);

export const publishCaseStudySchema = z
  .object({
    ...sharedCaseStudyFields,
    industry: z.string().trim().min(2, "Add an industry before publishing.").max(40, "Industry must be 40 characters or fewer."),
    excerpt: z
      .string()
      .trim()
      .min(10, "Add an excerpt (at least 10 characters) before publishing.")
      .max(300, "Excerpt must be 300 characters or fewer."),
    content: z
      .string()
      .max(200_000, "Content is too long.")
      .refine((html) => htmlToPlainText(html).length >= 50, "Write at least a couple of sentences (50+ characters) before publishing."),
    metrics: z.string().transform(parseMetricsField),
  })
  .superRefine(requireAltText);

export function caseStudySchemaFor(status: string) {
  return status === "published" ? publishCaseStudySchema : draftCaseStudySchema;
}

export type CaseStudyInput = z.input<typeof publishCaseStudySchema>;
export type CaseStudyField = keyof CaseStudyInput;

// ---------------------------------------------------------------------------
// Video testimonials
// ---------------------------------------------------------------------------

const sharedVideoTestimonialFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  role: optionalText(60, "Role must be 60 characters or fewer."),
  company: optionalText(60, "Company must be 60 characters or fewer."),
  status: sharedPostFields.status,
  poster_image: sharedPostFields.featured_image,
  poster_image_alt: z
    .string()
    .trim()
    .max(200, "Alt text must be 200 characters or fewer.")
    .transform((value) => value || null),
  sort_order: z.coerce.number().int("Whole numbers only.").min(0).max(9999),
};

function requirePoster(video: { poster_image: string | null; poster_image_alt: string | null }, ctx: z.RefinementCtx) {
  if (!video.poster_image) ctx.addIssue({ code: "custom", path: ["poster_image"], message: "Upload a poster image." });
  if (video.poster_image && !video.poster_image_alt) {
    ctx.addIssue({ code: "custom", path: ["poster_image_alt"], message: "Describe the image for accessibility." });
  }
}

// The video URL and poster are required at the database level regardless of status
// (there's no partial-content concept for a testimonial), so drafts and published
// rows share the same validation here.
const videoTestimonialFields = {
  ...sharedVideoTestimonialFields,
  video_url: z
    .string()
    .trim()
    .max(500, "Keep the URL under 500 characters.")
    .refine((url) => isVideoUrl(url), "Upload the video with the uploader."),
};

export const draftVideoTestimonialSchema = z.object(videoTestimonialFields).superRefine(requirePoster);
export const publishVideoTestimonialSchema = z.object(videoTestimonialFields).superRefine(requirePoster);

export function videoTestimonialSchemaFor(status: string) {
  return status === "published" ? publishVideoTestimonialSchema : draftVideoTestimonialSchema;
}

export type VideoTestimonialInput = z.input<typeof publishVideoTestimonialSchema>;
export type VideoTestimonialField = keyof VideoTestimonialInput;
