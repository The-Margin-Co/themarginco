"use client";

import { ExternalLink, History, LoaderCircle, PencilRuler, RotateCcw, Save, Send, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import type { z } from "zod";
import { discardDraft, publishDoc, restoreRevision, saveDraft, type CmsResult } from "@/app/admin/cms/actions";
import { FormBanner } from "@/components/ui/FormField";
import type { StaffRole } from "@/lib/auth";
import { docSchema, type DocSlug } from "@/lib/cms/registry";
import { auditPageSeo } from "@/lib/seo/audit";
import type { PageSeo, SiteSeo } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import { PageSeoFields } from "./PageSeoFields";
import { SchemaBlocks } from "./SchemaBlocks";
import { SchemaForm } from "./SchemaForm";
import { SeoAuditCard } from "./SeoAuditCard";
import { SiteSeoFields } from "./SiteSeoFields";

export type EditorTab = "content" | "seo" | "schema" | "history";
type Part = "content" | "seo";
type Errors = Record<string, string>;

export type RevisionRow = { id: string; part: Part; createdAt: string; publisher: string };

export type SeoContext = {
  fallbackTitle: string;
  fallbackDescription: string;
  hasFaqs: boolean;
  autoSchemas: { name: string; active: boolean; note?: string }[];
  otherTitles: string[];
  otherDescriptions: string[];
};

const FLASH_KEY = "margin-cms-flash";
const TAB_LABELS: Record<EditorTab, string> = { content: "Content", seo: "SEO", schema: "Schema", history: "History" };

function formatWhen(iso: string | null) {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function DocEditor({
  slug,
  kind,
  path,
  role,
  tabs,
  initialTab,
  initialContent,
  initialSeo,
  hasContentDraft,
  hasSeoDraft,
  contentPublishedAt,
  seoPublishedAt,
  revisions,
  seoContext,
}: {
  slug: DocSlug;
  kind: "page" | "site-content" | "site-seo";
  path: string | null;
  role: StaffRole;
  tabs: EditorTab[];
  initialTab: EditorTab;
  initialContent: Record<string, unknown>;
  initialSeo: PageSeo | SiteSeo;
  hasContentDraft: boolean;
  hasSeoDraft: boolean;
  contentPublishedAt: string | null;
  seoPublishedAt: string | null;
  revisions: RevisionRow[];
  seoContext?: SeoContext;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<EditorTab>(tabs.includes(initialTab) ? initialTab : tabs[0]);
  const [content, setContent] = useState(initialContent);
  const [seo, setSeo] = useState(initialSeo);
  const [saved, setSaved] = useState({ content: JSON.stringify(initialContent), seo: JSON.stringify(initialSeo) });
  const [drafts, setDrafts] = useState({ content: hasContentDraft, seo: hasSeoDraft });
  const [errors, setErrors] = useState<Record<Part, Errors>>({ content: {}, seo: {} });
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const canEditContent = role === "admin" && tabs.includes("content");
  const editsSeo = tabs.includes("seo");
  const dirty = {
    content: canEditContent && JSON.stringify(content) !== saved.content,
    seo: editsSeo && JSON.stringify(seo) !== saved.seo,
  };
  const anyDirty = dirty.content || dirty.seo;

  useEffect(() => {
    const flash = sessionStorage.getItem(FLASH_KEY);
    if (!flash) return;
    sessionStorage.removeItem(FLASH_KEY);
    const parsed = JSON.parse(flash) as { ok: boolean; message: string };
    queueMicrotask(() => setNotice(parsed));
  }, []);

  useEffect(() => {
    if (!anyDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const audit = useMemo(() => {
    if (kind !== "page" || !seoContext) return null;
    const pageSeo = seo as PageSeo;
    const title = pageSeo.meta_title || seoContext.fallbackTitle;
    const description = pageSeo.meta_description || seoContext.fallbackDescription;
    return auditPageSeo({
      seo: pageSeo,
      title,
      description,
      hasFaqs: seoContext.hasFaqs,
      duplicateTitle: seoContext.otherTitles.includes(title),
      duplicateDescription: seoContext.otherDescriptions.includes(description),
    });
  }, [kind, seo, seoContext]);

  function refreshWith(result: CmsResult) {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ ok: result.ok, message: result.message }));
    router.refresh();
  }

  async function saveParts(parts: Part[]) {
    for (const part of parts) {
      const result = await saveDraft(slug, part, part === "content" ? content : seo);
      if (!result.ok) {
        setErrors((current) => ({ ...current, [part]: result.errors ?? {} }));
        if (result.errors && part === "content") setTab("content");
        if (result.errors && part === "seo") setTab(tab === "schema" ? "schema" : "seo");
        setNotice({ ok: false, message: result.message });
        return false;
      }
      setErrors((current) => ({ ...current, [part]: {} }));
      setSaved((current) => ({ ...current, [part]: JSON.stringify(part === "content" ? content : seo) }));
      setDrafts((current) => ({ ...current, [part]: true }));
    }
    return true;
  }

  function run(label: string, task: () => Promise<void>) {
    setBusy(label);
    setNotice(null);
    startTransition(async () => {
      try {
        await task();
      } finally {
        setBusy(null);
      }
    });
  }

  const dirtyParts = (Object.keys(dirty) as Part[]).filter((part) => dirty[part]);
  const publishableParts = (["content", "seo"] as Part[]).filter(
    (part) => (part === "content" ? canEditContent : editsSeo) && (drafts[part] || dirty[part]),
  );

  const onSave = () =>
    run("save", async () => {
      if (dirtyParts.length === 0) return setNotice({ ok: true, message: "Nothing new to save." });
      if (await saveParts(dirtyParts)) setNotice({ ok: true, message: "Draft saved. Only signed-in editors can see it until you publish." });
    });

  const onPublish = () =>
    run("publish", async () => {
      if (!(await saveParts(dirtyParts))) return;
      const result = await publishDoc(slug, publishableParts);
      if (result.ok) refreshWith(result);
      else setNotice(result);
    });

  const onDiscard = (part: Part) =>
    run(`discard-${part}`, async () => {
      if (!window.confirm(`Discard the unpublished ${part === "content" ? "content" : "SEO"} changes and go back to the live version?`)) return;
      const result = await discardDraft(slug, part);
      if (result.ok) refreshWith(result);
      else setNotice(result);
    });

  const onRestore = (id: string) =>
    run(`restore-${id}`, async () => {
      if (anyDirty && !window.confirm("You have unsaved changes that will be replaced. Continue?")) return;
      const result = await restoreRevision(id);
      if (result.ok) refreshWith(result);
      else setNotice(result);
    });

  const status = (part: Part, publishedAt: string | null) => (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="font-semibold text-fg">{part === "content" ? "Content" : "SEO"}</span>
      {dirty[part] ? (
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-gold">Unsaved changes</span>
      ) : drafts[part] ? (
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-gold">Draft · not live</span>
      ) : (
        <span className="rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">Live</span>
      )}
      <span className="ml-auto text-zinc-500">{publishedAt ? `Published ${formatWhen(publishedAt)}` : "Using defaults"}</span>
    </div>
  );

  const schema = docSchema(slug) as z.ZodObject;
  const sections = Object.keys(schema.shape).filter((key) => {
    const child = schema.shape[key] as z.ZodType;
    const meta = child.meta() as { kind?: string; label?: string } | undefined;
    return meta?.kind === "section" || meta?.kind === "group";
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        {notice && <FormBanner tone={notice.ok ? "success" : "error"}>{notice.message}</FormBanner>}

        {tabs.length > 1 && (
          <div role="tablist" aria-label="Editor sections" className="flex w-fit gap-1 rounded-full border border-line bg-charcoal p-1">
            {tabs.map((item) => (
              <button
                key={item}
                role="tab"
                type="button"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  tab === item ? "bg-accent text-on-accent" : "text-muted hover:text-fg",
                )}
              >
                {TAB_LABELS[item]}
                {item === "content" && dirty.content && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-current align-middle" />}
                {(item === "seo" || item === "schema") && dirty.seo && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-current align-middle" />}
              </button>
            ))}
          </div>
        )}

        {tab === "content" && canEditContent && (
          <SchemaForm schema={schema} value={content} onChange={setContent} errors={errors.content} sectionIds />
        )}

        {tab === "seo" && kind === "page" && seoContext && path && (
          <PageSeoFields
            seo={seo as PageSeo}
            onChange={setSeo}
            errors={errors.seo}
            path={path}
            fallbackTitle={seoContext.fallbackTitle}
            fallbackDescription={seoContext.fallbackDescription}
            showFaqToggle={seoContext.hasFaqs}
          />
        )}
        {tab === "seo" && kind === "site-seo" && <SiteSeoFields seo={seo as SiteSeo} onChange={setSeo} errors={errors.seo} />}

        {tab === "schema" && kind === "page" && seoContext && (
          <SchemaBlocks
            blocks={(seo as PageSeo).schemas}
            onChange={(schemas) => setSeo({ ...(seo as PageSeo), schemas })}
            autoSchemas={seoContext.autoSchemas}
          />
        )}

        {tab === "history" && (
          <div className="card overflow-hidden">
            {revisions.length === 0 ? (
              <p className="p-6 text-sm">No published versions yet. Every publish is saved here so you can roll back.</p>
            ) : (
              <ul className="divide-y divide-line">
                {revisions.map((revision) => {
                  const allowed = revision.part === "seo" || role === "admin";
                  return (
                    <li key={revision.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                      <History aria-hidden className="size-4 text-muted" />
                      <span className="font-semibold text-fg">{revision.part === "content" ? "Content" : "SEO"}</span>
                      <span>{formatWhen(revision.createdAt)}</span>
                      <span className="text-zinc-500">by {revision.publisher}</span>
                      {allowed && (
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => onRestore(revision.id)}
                          className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg hover:border-accent/60 hover:text-gold"
                        >
                          {busy === `restore-${revision.id}` ? <LoaderCircle className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                          Restore to draft
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <div className="card space-y-4 p-5">
          {canEditContent && status("content", contentPublishedAt)}
          {editsSeo && status("seo", seoPublishedAt)}

          <div className="grid gap-2 pt-1">
            <ActionButton onClick={onSave} busy={busy === "save"} disabled={busy !== null || !anyDirty} icon={<Save className="size-4" />}>
              Save draft
            </ActionButton>
            <ActionButton
              primary
              onClick={onPublish}
              busy={busy === "publish"}
              disabled={busy !== null || publishableParts.length === 0}
              icon={<Send className="size-4" />}
            >
              Publish {publishableParts.length === 1 ? (publishableParts[0] === "content" ? "content" : "SEO") : "changes"}
            </ActionButton>
          </div>

          {(drafts.content || drafts.seo) && (
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              {drafts.content && canEditContent && (
                <button type="button" onClick={() => onDiscard("content")} className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-danger">
                  <Undo2 className="size-3.5" /> Discard content draft
                </button>
              )}
              {drafts.seo && editsSeo && (
                <button type="button" onClick={() => onDiscard("seo")} className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-danger">
                  <Undo2 className="size-3.5" /> Discard SEO draft
                </button>
              )}
            </div>
          )}

          {path && (
            <div className="grid gap-2 border-t border-line pt-3">
              <form action="/api/admin/edit-mode" method="post">
                <input type="hidden" name="path" value={path} />
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-accent/40 text-sm font-semibold text-gold transition-colors hover:bg-accent/10"
                >
                  <PencilRuler className="size-4" /> Edit on site
                </button>
              </form>
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-fg"
              >
                View live page <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}
        </div>

        {audit && (
          <div className="card p-5">
            <SeoAuditCard audit={audit} compact={tab === "content"} />
          </div>
        )}

        {tab === "content" && canEditContent && sections.length > 0 && (
          <nav aria-label="Jump to section" className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Sections</p>
            <ul className="mt-3 space-y-1">
              {sections.map((key) => {
                const meta = (schema.shape[key] as z.ZodType).meta() as { label?: string } | undefined;
                const hidden = (content[key] as { visible?: boolean } | undefined)?.visible === false;
                return (
                  <li key={key}>
                    <a href={`#section-${key}`} className="flex items-center justify-between rounded-md px-2 py-1 text-sm text-muted hover:bg-fg/5 hover:text-fg">
                      {meta?.label ?? key}
                      {hidden && <span className="text-[10px] uppercase tracking-wider text-zinc-600">Hidden</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </aside>
    </div>
  );
}

function ActionButton({
  primary = false,
  busy,
  disabled,
  onClick,
  icon,
  children,
}: {
  primary?: boolean;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50",
        primary ? "bg-accent text-on-accent hover:bg-accent-2" : "border border-line text-fg hover:border-accent/60 hover:text-gold",
      )}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
