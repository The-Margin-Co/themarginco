"use client";

import { Check, ExternalLink, LoaderCircle, Save, Send, EyeOff } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { FormBanner, FormField, inputStyles } from "@/components/ui/FormField";
import { cn, formatDate } from "@/lib/utils";
import type { VideoTestimonialFormValues } from "@/lib/video-testimonial-form";
import {
  draftVideoTestimonialSchema,
  publishVideoTestimonialSchema,
  toFieldErrors,
  videoTestimonialSchemaFor,
  type FormState,
  type PostStatus,
  type VideoTestimonialField,
} from "@/lib/validation";
import { FeaturedImageField } from "./FeaturedImageField";
import { VideoUploadField } from "./VideoUploadField";
import { Panel } from "./PostEditor";

type ClientErrors = Partial<Record<VideoTestimonialField, string | null>>;
type VideoTestimonialAction = (
  state: FormState<VideoTestimonialField>,
  formData: FormData,
) => Promise<FormState<VideoTestimonialField>>;

const FIELD_ORDER: VideoTestimonialField[] = ["name", "role", "company", "video_url", "poster_image", "poster_image_alt"];
const INITIAL_STATE: FormState<VideoTestimonialField> = { status: "idle" };

function fieldError(field: VideoTestimonialField, values: VideoTestimonialFormValues) {
  if (field === "poster_image_alt" && values.poster_image && !values.poster_image_alt.trim()) {
    return "Describe the image for accessibility.";
  }
  const shape = draftVideoTestimonialSchema.shape[field as keyof typeof draftVideoTestimonialSchema.shape];
  const result = shape?.safeParse(values[field as keyof VideoTestimonialFormValues]);
  return result && !result.success ? (result.error.issues[0]?.message ?? "This field is invalid.") : null;
}

export function VideoTestimonialEditor({
  mode,
  initial,
  initialStatus,
  action,
  notice,
  publishedAt,
  updatedAt,
}: {
  mode: "create" | "edit";
  initial: VideoTestimonialFormValues;
  initialStatus: PostStatus;
  action: VideoTestimonialAction;
  notice?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [values, setValues] = useState<VideoTestimonialFormValues>(initial);
  const [saved, setSaved] = useState({ values: initial, status: initialStatus });
  const [submission, setSubmission] = useState({ values: initial, status: initialStatus });
  const [seenState, setSeenState] = useState(state);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setSaved(submission);
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(saved.values);

  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  const errorFor = (field: VideoTestimonialField) =>
    field in clientErrors ? clientErrors[field] : state.fieldErrors?.[field];

  function setField<K extends keyof VideoTestimonialFormValues>(field: K, value: VideoTestimonialFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (typeof field === "string" && field in clientErrors) {
      const next = { ...values, [field]: value };
      setClientErrors((errors) => ({ ...errors, [field]: fieldError(field as VideoTestimonialField, next) }));
    }
  }

  function validateOnBlur(field: VideoTestimonialField) {
    if (values[field as keyof VideoTestimonialFormValues] === "" && !(field in clientErrors)) return;
    setClientErrors((errors) => ({ ...errors, [field]: fieldError(field, values) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status: PostStatus = submitter?.value === "published" ? "published" : "draft";
    const result = videoTestimonialSchemaFor(status).safeParse({ ...values, status });

    if (!result.success) {
      event.preventDefault();
      const errors = toFieldErrors<VideoTestimonialField>(result.error);
      setClientErrors(Object.fromEntries(FIELD_ORDER.map((field) => [field, errors[field] ?? null])));
      const first = FIELD_ORDER.find((field) => errors[field]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#video-${first}`)?.focus();
      return;
    }
    setClientErrors({});
    setSubmission({ values, status });
  }

  const describedBy = (field: VideoTestimonialField) => (errorFor(field) ? `video-${field}-error` : undefined);
  const inputProps = (field: "name" | "role" | "company") => ({
    id: `video-${field}`,
    name: field,
    value: values[field],
    onChange: (event: { target: { value: string } }) => setField(field, event.target.value),
    onBlur: () => validateOnBlur(field),
    "aria-invalid": errorFor(field) ? true : undefined,
    "aria-describedby": describedBy(field),
  });

  const readiness = [
    { label: "Name", done: publishVideoTestimonialSchema.shape.name.safeParse(values.name).success },
    { label: "Video uploaded", done: publishVideoTestimonialSchema.shape.video_url.safeParse(values.video_url).success },
    { label: "Poster image + alt text", done: Boolean(values.poster_image && values.poster_image_alt.trim()) },
  ];

  const isLive = saved.status === "published";
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
      <input type="hidden" name="poster_image" value={values.poster_image} />
      <input type="hidden" name="video_url" value={values.video_url} />
      {/* FeaturedImageField's own alt input is named for blog posts (featured_image_alt), so the
          field the server action reads has to be submitted explicitly. */}
      <input type="hidden" name="poster_image_alt" value={values.poster_image_alt} />

      <div className="min-w-0 space-y-6">
        {banner}

        <Panel title="Video" description="A client testimonial shown on the homepage.">
          <FormField id="video-name" label="Name" required error={errorFor("name")}>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              className={inputStyles(Boolean(errorFor("name")))}
              {...inputProps("name")}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="video-role" label="Role (optional)" error={errorFor("role")}>
              <input
                type="text"
                placeholder="e.g. Founder"
                maxLength={60}
                className={inputStyles(Boolean(errorFor("role")))}
                {...inputProps("role")}
              />
            </FormField>
            <FormField id="video-company" label="Company (optional)" error={errorFor("company")}>
              <input
                type="text"
                placeholder="e.g. DTC skincare brand"
                maxLength={60}
                className={inputStyles(Boolean(errorFor("company")))}
                {...inputProps("company")}
              />
            </FormField>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">
              Video <span className="text-gold" aria-hidden>*</span>
            </p>
            <VideoUploadField
              url={values.video_url}
              error={errorFor("video_url")}
              onUrlChange={(url) => setField("video_url", url)}
              onPosterCaptured={(posterUrl, alt) => {
                setField("poster_image", posterUrl);
                if (!values.poster_image_alt.trim()) setField("poster_image_alt", `Still from the video: ${alt}`.slice(0, 200));
              }}
            />
          </div>
        </Panel>

        <Panel title="Poster image" description="Shown before the video is played.">
          <FeaturedImageField
            url={values.poster_image}
            alt={values.poster_image_alt}
            altError={errorFor("poster_image_alt")}
            imageError={errorFor("poster_image")}
            onUrlChange={(url) => setField("poster_image", url)}
            onAltChange={(alt) => setField("poster_image_alt", alt)}
            onAltBlur={() => validateOnBlur("poster_image_alt")}
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
                  <Send aria-hidden className="size-4" /> Update
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

          {isLive && (
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gold hover:underline">
              View on the homepage <ExternalLink aria-hidden className="size-3.5" />
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
                  <span className="sr-only">{item.done ? "complete" : "incomplete"}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Order">
          <FormField id="video-sort_order" label="Sort order" hint="Lower numbers show first.">
            <input
              id="video-sort_order"
              name="sort_order"
              type="number"
              min={0}
              max={9999}
              value={values.sort_order}
              onChange={(event) => setField("sort_order", Number(event.target.value))}
              className={inputStyles(false)}
            />
          </FormField>
        </Panel>
      </aside>
    </form>
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
