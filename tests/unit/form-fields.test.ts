import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A server action only sees inputs that carry a `name`. Reusing a shared field component (e.g. the
// image field, whose alt input is named for blog posts) can silently drop a field the action needs;
// the schema then rejects a form that looks complete. These checks catch that at test time.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

function actionFields(source: string) {
  const block = source.match(/const FIELDS[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
  return [...block.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]);
}

describe.each([
  ["video testimonials", "app/admin/video-testimonials/actions.ts", "components/admin/VideoTestimonialEditor.tsx", ["status"]],
  ["case studies", "app/admin/case-studies/actions.ts", "components/admin/CaseStudyEditor.tsx", ["status"]],
])("%s form", (_label, actions, editor, submittedByButtons) => {
  const editorSource = read(editor) + read("components/admin/FeaturedImageField.tsx");
  const fields = actionFields(read(actions)).filter((field) => !submittedByButtons.includes(field));

  it("reads at least one field", () => expect(fields.length).toBeGreaterThan(3));

  it.each(fields)("submits `%s`", (field) => {
    const named =
      new RegExp(`name="${field}"`).test(editorSource) || // literal name
      new RegExp(`name: field`).test(editorSource); // inputProps() helper spreads name from the field key
    expect(named).toBe(true);
  });
});

describe("video testimonial poster alt", () => {
  it("is submitted under the name the action reads (not the blog editor's name)", () => {
    expect(read("components/admin/VideoTestimonialEditor.tsx")).toContain('name="poster_image_alt"');
  });
});
