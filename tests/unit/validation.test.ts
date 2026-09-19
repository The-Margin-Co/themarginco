import { describe, expect, it } from "vitest";
import { leadSchema, publishVideoTestimonialSchema } from "@/lib/validation";
import { signOgTitle, verifyOgTitle } from "@/lib/seo/og-sign";
import { safeAdminPath } from "@/lib/auth";

const base = "https://example.supabase.co/storage/v1/object/public";

describe("lead form schema", () => {
  const valid = { name: "Ada Lovelace", email: "  ADA@Example.com ", service: "meta-ads", message: "We want to lower our CPA." };
  it("normalises and accepts a good submission", () => {
    const parsed = leadSchema.safeParse(valid);
    expect(parsed.success && parsed.data.email).toBe("ada@example.com");
  });
  it("rejects a bad service, short message and oversize fields", () => {
    expect(leadSchema.safeParse({ ...valid, service: "hacking" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, message: "short" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, name: "x".repeat(101) }).success).toBe(false);
  });
});

describe("video testimonial schema", () => {
  const valid = {
    name: "Dana Shore",
    role: "Founder",
    company: "",
    status: "published",
    video_url: `${base}/videos/testimonials/2026/09/a.mp4`,
    poster_image: `${base}/media/blog/2026/09/p.jpg`,
    poster_image_alt: "Dana speaking to camera",
    sort_order: "0",
  };
  it("accepts self-hosted video and poster URLs", () => {
    expect(publishVideoTestimonialSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects YouTube links, other hosts and javascript: URLs", () => {
    for (const video_url of ["https://www.youtube.com/watch?v=abc", "https://evil.example/a.mp4", "javascript:alert(1)"]) {
      expect(publishVideoTestimonialSchema.safeParse({ ...valid, video_url }).success).toBe(false);
    }
  });
  it("requires a poster and its alt text", () => {
    expect(publishVideoTestimonialSchema.safeParse({ ...valid, poster_image: "" }).success).toBe(false);
    expect(publishVideoTestimonialSchema.safeParse({ ...valid, poster_image_alt: "" }).success).toBe(false);
  });
});

describe("safeAdminPath", () => {
  it("only allows same-site /admin paths", () => {
    expect(safeAdminPath("/admin/blog")).toBe("/admin/blog");
    for (const bad of ["https://evil.example", "//evil.example", "/admin/login", "/blog", "/admin/../etc", "/admin/x\\y", 42]) {
      expect(safeAdminPath(bad)).toBe("/admin/pages");
    }
  });
});

describe("og signing", () => {
  it("accepts unsigned titles only when no secret is configured", () => {
    delete process.env.OG_SIGNING_SECRET;
    expect(verifyOgTitle("Hello", null)).toBe(true);
  });
  it("requires a valid signature once a secret is set", () => {
    process.env.OG_SIGNING_SECRET = "test-secret-test-secret-test-secret";
    const signature = signOgTitle("Hello");
    expect(signature).toBeTruthy();
    expect(verifyOgTitle("Hello", signature)).toBe(true);
    expect(verifyOgTitle("Hello!", signature)).toBe(false);
    expect(verifyOgTitle("Hello", null)).toBe(false);
    expect(verifyOgTitle("Hello", "x".repeat(24))).toBe(false);
    delete process.env.OG_SIGNING_SECRET;
  });
});
