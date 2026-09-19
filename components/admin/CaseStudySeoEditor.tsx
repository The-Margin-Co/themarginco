"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { FormBanner } from "@/components/ui/FormField";
import type { PostSeo } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import type { CaseStudyField, FormState } from "@/lib/validation";
import { CaseStudySeoSection, type CaseStudyMeta } from "./cms/CaseStudySeoSection";
import { Panel } from "./PostEditor";

type SeoAction = (state: FormState<CaseStudyField>, formData: FormData) => Promise<FormState<CaseStudyField>>;

/** SEO-only view of a case study for SEO editors: the article itself is read-only. */
export function CaseStudySeoEditor({
  action,
  caseStudy,
  initialMeta,
  initialSeo,
}: {
  action: SeoAction;
  caseStudy: { title: string; slug: string; excerpt: string; status: string; featuredImage: string };
  initialMeta: CaseStudyMeta;
  initialSeo: PostSeo;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [meta, setMeta] = useState(initialMeta);
  const [seo, setSeo] = useState(initialSeo);
  const [saved, setSaved] = useState({ meta: initialMeta, seo: initialSeo });
  const [submission, setSubmission] = useState(saved);
  const [seenState, setSeenState] = useState(state);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setSaved(submission);
  }

  const dirty = JSON.stringify([meta, seo]) !== JSON.stringify([saved.meta, saved.seo]);

  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  const errors = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  const isLive = caseStudy.status === "published";

  return (
    <form action={formAction} onSubmit={() => setSubmission({ meta, seo })} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="meta_title" value={meta.meta_title} />
      <input type="hidden" name="meta_description" value={meta.meta_description} />
      <input type="hidden" name="meta_keywords" value={meta.meta_keywords} />
      <input type="hidden" name="seo" value={JSON.stringify(seo)} />

      <div className="min-w-0 space-y-6">
        {state.status !== "idle" && state.message && (
          <FormBanner tone={state.status === "success" ? "success" : "error"}>{state.message}</FormBanner>
        )}
        <Panel title="Search engine optimisation" description="Control how this case study appears on Google and social media.">
          <CaseStudySeoSection
            meta={meta}
            seo={seo}
            onMetaChange={setMeta}
            onSeoChange={setSeo}
            errors={errors}
            slug={caseStudy.slug}
            fallbackTitle={caseStudy.title}
            fallbackDescription={caseStudy.excerpt}
            image={caseStudy.featuredImage}
          />
        </Panel>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Panel
          title="Case study"
          action={
            <Badge tone={isLive ? "accent" : "neutral"} dot={isLive}>
              {isLive ? "Published" : "Draft"}
            </Badge>
          }
        >
          <p className="font-semibold text-fg">{caseStudy.title}</p>
          <p className="text-xs">Your role can change SEO settings only. Ask an admin to edit the case study itself.</p>
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-on-accent hover:bg-accent-2 disabled:opacity-60"
          >
            {pending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
            Save SEO
          </button>
          <p className={cn("text-center text-xs", dirty ? "text-gold" : "text-muted")}>
            {dirty ? "You have unsaved changes" : "All changes saved"}
          </p>
          {isLive && (
            <a
              href={`/case-studies/${caseStudy.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gold hover:underline"
            >
              View live case study <ExternalLink aria-hidden className="size-3.5" />
            </a>
          )}
        </Panel>
      </aside>
    </form>
  );
}
