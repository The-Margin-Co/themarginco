"use client";

import { Check, ExternalLink, LoaderCircle, Send, Save, EyeOff } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { FormBanner, FormField, inputStyles } from "@/components/ui/FormField";
import { cn, formatDate, htmlToPlainText, slugify } from "@/lib/utils";
import {
  POST_CATEGORIES,
  draftPostSchema,
  postSchemaFor,
  publishPostSchema,
  toFieldErrors,
  type FormState,
  type PostField,
  type PostStatus,
} from "@/lib/validation";
import type { PostFormValues } from "@/lib/post-form";
import { FeaturedImageField } from "./FeaturedImageField";
import { RichTextEditor } from "./RichTextEditor";
import { postSeoDefaults, type PostSeo } from "@/lib/seo/schema";
import { PostSeoSection } from "./cms/PostSeoSection";

type ClientErrors = Partial<Record<PostField, string | null>>;
type PostAction = (state: FormState<PostField>, formData: FormData) => Promise<FormState<PostField>>;

const FIELD_ORDER: PostField[] = [
  "title",
  "slug",
  "excerpt",
  "content",
  "category",
  "featured_image",
  "featured_image_alt",
  "meta_title",
  "meta_description",
  "meta_keywords",
];
const INITIAL_STATE: FormState<PostField> = { status: "idle" };

function fieldError(field: PostField, values: PostFormValues) {
  if (field === "status") return null;
  if (field === "featured_image_alt" && values.featured_image && !values.featured_image_alt.trim()) {
    return "Describe the image for accessibility and SEO.";
  }
  const result = draftPostSchema.shape[field].safeParse(values[field]);
  return result.success ? null : (result.error.issues[0]?.message ?? "This field is invalid.");
}

export function PostEditor({
  mode,
  initial,
  initialStatus,
  action,
  notice,
  publishedAt,
  updatedAt,
  initialSeo,
}: {
  mode: "create" | "edit";
  initial: PostFormValues;
  initialStatus: PostStatus;
  action: PostAction;
  notice?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  initialSeo?: PostSeo;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [values, setValues] = useState<PostFormValues>(initial);
  const [seo, setSeo] = useState<PostSeo>(() => initialSeo ?? postSeoDefaults());
  const [saved, setSaved] = useState({ values: initial, seo, status: initialStatus });
  const [submission, setSubmission] = useState({ values: initial, seo, status: initialStatus });
  const [seenState, setSeenState] = useState(state);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setSaved(submission);
  }

  const dirty = JSON.stringify([values, seo]) !== JSON.stringify([saved.values, saved.seo]);

  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  const errorFor = (field: PostField) =>
    field in clientErrors ? clientErrors[field] : state.fieldErrors?.[field];

  function withField(current: PostFormValues, field: keyof PostFormValues, value: string) {
    const next = { ...current, [field]: value };
    if (field === "title" && !slugTouched) next.slug = slugify(value);
    return next;
  }

  function setField(field: keyof PostFormValues, value: string) {
    setValues((current) => withField(current, field, value));
    const next = withField(values, field, value);
    const updates: ClientErrors = {};
    if (field in clientErrors) updates[field] = fieldError(field, next);
    if (field === "title" && !slugTouched && "slug" in clientErrors) updates.slug = fieldError("slug", next);
    if (Object.keys(updates).length > 0) setClientErrors((errors) => ({ ...errors, ...updates }));
  }

  function validateOnBlur(field: keyof PostFormValues) {
    if (values[field] === "" && !(field in clientErrors)) return;
    setClientErrors((errors) => ({ ...errors, [field]: fieldError(field, values) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status: PostStatus = submitter?.value === "published" ? "published" : "draft";
    const result = postSchemaFor(status).safeParse({ ...values, status });

    if (!result.success) {
      event.preventDefault();
      const errors = toFieldErrors<PostField>(result.error);
      setClientErrors(Object.fromEntries(FIELD_ORDER.map((field) => [field, errors[field] ?? null])));
      const first = FIELD_ORDER.find((field) => errors[field]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#post-${first}`)?.focus();
      return;
    }
    setClientErrors({});
    setSubmission({ values, seo, status });
  }

  const describedBy = (field: PostField) => (errorFor(field) ? `post-${field}-error` : undefined);
  const inputProps = (field: keyof PostFormValues) => ({
    id: `post-${field}`,
    name: field,
    value: values[field],
    onChange: (event: { target: { value: string } }) => setField(field, event.target.value),
    onBlur: () => validateOnBlur(field),
    "aria-invalid": errorFor(field) ? true : undefined,
    "aria-describedby": describedBy(field),
  });

  const readiness = [
    { label: "Title", done: publishPostSchema.shape.title.safeParse(values.title).success, required: true },
    { label: "URL slug", done: publishPostSchema.shape.slug.safeParse(values.slug).success, required: true },
    { label: "Category", done: publishPostSchema.shape.category.safeParse(values.category).success, required: true },
    { label: "Excerpt", done: publishPostSchema.shape.excerpt.safeParse(values.excerpt).success, required: true },
    { label: "Content (50+ characters)", done: htmlToPlainText(values.content).length >= 50, required: true },
    { label: "Featured image + alt text", done: Boolean(values.featured_image && values.featured_image_alt.trim()), required: false },
    { label: "Meta title", done: values.meta_title.trim().length > 0, required: false },
    { label: "Meta description", done: values.meta_description.trim().length >= 50, required: false },
  ];

  const isLive = saved.status === "published";
  const liveSlug = saved.values.slug;
  const banner =
    state.status === "error" ? (
      <FormBanner tone="error">{state.message}</FormBanner>
    ) : state.status === "success" ? (
      <FormBanner tone="success">{state.message}</FormBanner>
    ) : notice ? (
      <FormBanner tone="success">{notice}</FormBanner>
    ) : null;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <input type="hidden" name="content" value={values.content} />
      <input type="hidden" name="featured_image" value={values.featured_image} />
      <input type="hidden" name="seo" value={JSON.stringify(seo)} />
      <input type="hidden" name="meta_title" value={values.meta_title} />
      <input type="hidden" name="meta_description" value={values.meta_description} />
      <input type="hidden" name="meta_keywords" value={values.meta_keywords} />

      <div className="min-w-0 space-y-6">
        {banner}

        <Panel title="Content" description="What readers see on the article page.">
          <FormField id="post-title" label="Title" required error={errorFor("title")}>
            <input
              type="text"
              placeholder="e.g. The 3-layer Meta Ads structure that scales"
              className={inputStyles(Boolean(errorFor("title")), "font-display text-xl font-bold")}
              {...inputProps("title")}
            />
          </FormField>

          <FormField
            id="post-slug"
            label="URL slug"
            required
            error={errorFor("slug")}
            hint={slugTouched ? "Custom" : "Generated from title"}
          >
            <div
              className={cn(
                "flex items-center overflow-hidden rounded-xl border bg-ink/70 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/60",
                errorFor("slug") ? "border-danger/80" : "border-line",
              )}
            >
              <span className="whitespace-nowrap border-r border-line px-3 py-3 font-mono text-sm text-muted">/blog/</span>
              <input
                type="text"
                spellCheck={false}
                placeholder="your-post-slug"
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-fg placeholder:text-zinc-500 focus:outline-none"
                {...inputProps("slug")}
                onChange={(event) => {
                  const slug = event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  setSlugTouched(slug !== "");
                  setField("slug", slug);
                }}
              />
            </div>
          </FormField>

          <FormField
            id="post-excerpt"
            label="Excerpt"
            error={errorFor("excerpt")}
            hint={
              <span className={values.excerpt.length > 300 ? "text-danger" : undefined}>
                {values.excerpt.length}/300
              </span>
            }
          >
            <textarea
              rows={3}
              placeholder="A one or two sentence summary shown on blog cards and under the title."
              className={inputStyles(Boolean(errorFor("excerpt")), "resize-y")}
              {...inputProps("excerpt")}
            />
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-fg">
              Article body <span className="text-gold" aria-hidden>*</span>
            </p>
            <RichTextEditor
              id="post-content"
              value={values.content}
              onChange={(html) => setField("content", html)}
              onBlur={() => validateOnBlur("content")}
              invalid={Boolean(errorFor("content"))}
              describedBy={describedBy("content")}
            />
            {errorFor("content") && (
              <p id="post-content-error" className="mt-2 text-sm text-danger">
                {errorFor("content")}
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Search engine optimisation" description="Control how this article appears on Google and social media.">
          <PostSeoSection
            meta={{ meta_title: values.meta_title, meta_description: values.meta_description, meta_keywords: values.meta_keywords }}
            seo={seo}
            onMetaChange={(meta) => {
              for (const key of ["meta_title", "meta_description", "meta_keywords"] as const) {
                if (meta[key] !== values[key]) setField(key, meta[key]);
              }
            }}
            onSeoChange={setSeo}
            errors={Object.fromEntries(
              (["meta_title", "meta_description", "meta_keywords"] as const)
                .map((key) => [key, errorFor(key)])
                .filter((entry): entry is [string, string] => Boolean(entry[1])),
            )}
            slug={values.slug}
            fallbackTitle={values.title}
            fallbackDescription={values.excerpt}
            image={values.featured_image}
          />
        </Panel>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Panel
          title="Publish"
          action={
            <Badge tone={isLive ? "accent" : "neutral"} dot={isLive}>
              {isLive ? "Published" : "Draft"}
            </Badge>
          }
        >
          <div className="flex flex-col gap-2">
            {isLive ? (
              <>
                <SubmitButton value="published" primary pending={pending && submission.status === "published"}>
                  <Send aria-hidden className="size-4" /> Update post
                </SubmitButton>
                <SubmitButton value="draft" pending={pending && submission.status === "draft"}>
                  <EyeOff aria-hidden className="size-4" /> Unpublish to draft
                </SubmitButton>
              </>
            ) : (
              <>
                <SubmitButton value="draft" pending={pending && submission.status === "draft"}>
                  <Save aria-hidden className="size-4" /> Save draft
                </SubmitButton>
                <SubmitButton value="published" primary pending={pending && submission.status === "published"}>
                  <Send aria-hidden className="size-4" /> Publish now
                </SubmitButton>
              </>
            )}
          </div>

          <p className={cn("text-center text-xs", dirty ? "text-gold" : "text-muted")}>
            {dirty ? "You have unsaved changes" : mode === "edit" ? "All changes saved" : "Not saved yet"}
          </p>

          {isLive && liveSlug && (
            <a
              href={`/blog/${liveSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gold hover:underline"
            >
              View live post <ExternalLink aria-hidden className="size-3.5" />
            </a>
          )}

          {(publishedAt || updatedAt) && (
            <dl className="space-y-1 border-t border-line pt-4 text-xs">
              {publishedAt && (
                <div className="flex justify-between">
                  <dt>First published</dt>
                  <dd className="text-fg">{formatDate(publishedAt)}</dd>
                </div>
              )}
              {updatedAt && (
                <div className="flex justify-between">
                  <dt>Last updated</dt>
                  <dd className="text-fg">{formatDate(updatedAt)}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="border-t border-line pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Publishing checklist</p>
            <ul className="mt-3 space-y-2 text-sm">
              {readiness.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border",
                      item.done ? "border-accent bg-accent text-on-accent" : "border-line text-transparent",
                    )}
                  >
                    <Check aria-hidden className="size-3" />
                  </span>
                  <span className={item.done ? "text-fg" : undefined}>{item.label}</span>
                  {!item.required && <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-500">SEO</span>}
                  <span className="sr-only">{item.done ? "complete" : "incomplete"}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Featured image" description="Shown on blog cards, the article header and social shares.">
          <FeaturedImageField
            url={values.featured_image}
            alt={values.featured_image_alt}
            altError={errorFor("featured_image_alt")}
            imageError={errorFor("featured_image")}
            onUrlChange={(url) => setField("featured_image", url)}
            onAltChange={(alt) => setField("featured_image_alt", alt)}
            onAltBlur={() => validateOnBlur("featured_image_alt")}
          />
        </Panel>

        <Panel title="Organise">
          <FormField id="post-category" label="Category" error={errorFor("category")}>
            <select className={inputStyles(Boolean(errorFor("category")))} {...inputProps("category")}>
              <option value="">Choose a category</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>
        </Panel>
      </aside>
    </form>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-line bg-ink-2/50 px-5 py-4">
        <div>
          <h2 className="font-sans text-sm font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs">{description}</p>}
        </div>
        {action}
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function SubmitButton({
  value,
  primary = false,
  pending,
  children,
}: {
  value: PostStatus;
  primary?: boolean;
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all disabled:opacity-60",
        primary
          ? "bg-accent text-on-accent shadow-[0_10px_30px_-10px_rgb(250_204_21/0.7)] hover:bg-accent-2"
          : "border border-line text-fg hover:border-accent/60 hover:text-gold",
      )}
    >
      {pending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
