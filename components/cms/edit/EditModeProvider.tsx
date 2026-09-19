"use client";

import { ExternalLink, LoaderCircle, LogOut, PencilRuler, Save, Search, Send, Undo2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import {
  discardDraft,
  loadInlineStatus,
  publishDoc,
  saveDraft,
  saveInlineDraft,
  type CmsResult,
  type InlineStatus,
} from "@/app/admin/cms/actions";
import { ScoreRing } from "@/components/admin/cms/SeoAuditCard";
import type { StaffRole } from "@/lib/auth";
import { PAGES, PAGE_SLUGS, type DocSlug, type PageSlug } from "@/lib/cms/registry";
import { auditPageSeo } from "@/lib/seo/audit";
import type { PageSeo } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import type { Bind } from "../Editable";
import { SectionDrawer, SeoDrawer } from "./Drawers";
import { countPatches, EditModeContext, withPatch, type DocErrors, type EditModeValue, type Patches, type SectionTarget } from "./store";

type Target = { slug: PageSlug; label: string; isPost: boolean };

function targetFor(pathname: string): Target | null {
  const page = PAGE_SLUGS.find((slug) => PAGES[slug].path === pathname);
  if (page) return { slug: page, label: PAGES[page].label, isPost: false };
  if (pathname.startsWith("/blog/")) return { slug: "blog", label: "Blog article", isPost: true };
  if (pathname.startsWith("/case-studies/")) return { slug: "case-studies", label: "Case study", isPost: true };
  return null;
}

type Flash = { ok: boolean; text: string };

/**
 * Client side of the inline editor (only mounted for staff in Draft Mode): collects edits,
 * saves them as drafts, publishes, and renders the edit dock and side panels.
 */
export function EditModeProvider({ role, children }: { role: StaffRole; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const target = targetFor(pathname);
  const canEditContent = role === "admin";
  const inAdmin = pathname.startsWith("/admin");

  const [patches, setPatches] = useState<Patches>({});
  const [errors, setErrors] = useState<DocErrors>({});
  const [section, setSection] = useState<(SectionTarget & { pathname: string }) | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoEdit, setSeoEdit] = useState<{ slug: PageSlug; seo: PageSeo } | null>(null);
  const [seoErrors, setSeoErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ slug: PageSlug; data: InlineStatus } | null>(null);
  const [statusVersion, setStatusVersion] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [busy, startTransition] = useTransition();
  const exitForm = useRef<HTMLFormElement>(null);

  const slug = target?.slug;
  const pageStatus = status && status.slug === slug ? status.data : null;
  const workingSeo = seoEdit && seoEdit.slug === slug ? seoEdit.seo : null;
  const currentSeo = workingSeo ?? pageStatus?.seo ?? null;
  const unsaved = countPatches(patches) + (workingSeo ? 1 : 0);
  const openSection = section && section.pathname === pathname ? section : null;
  const showSeo = Boolean(target && !target.isPost);

  useEffect(() => {
    if (!slug || inAdmin) return;
    let cancelled = false;
    void loadInlineStatus(slug).then((data) => {
      if (!cancelled && data) setStatus({ slug, data });
    });
    return () => {
      cancelled = true;
    };
  }, [slug, statusVersion, inAdmin]);

  useEffect(() => {
    if (unsaved === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 6000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const setValue = useCallback((bind: Bind, value: unknown, serverValue?: unknown) => {
    setPatches((current) => withPatch(current, bind, value, serverValue));
  }, []);

  const syncSection = useCallback((bind: Bind, next: Record<string, unknown>) => {
    setSection((current) =>
      current && current.bind.doc === bind.doc && current.bind.path === bind.path && current.value !== next ? { ...current, value: next } : current,
    );
  }, []);

  const value = useMemo<EditModeValue>(
    () => ({
      role,
      canEditContent,
      patches,
      errors,
      setValue,
      openSection: (next) => {
        setSeoOpen(false);
        setSection({ ...next, pathname });
      },
      syncSection,
    }),
    [role, canEditContent, patches, errors, setValue, syncSection, pathname],
  );

  /** Saves every pending edit as a draft. Returns the docs that now have drafts, or null on failure. */
  async function persist(): Promise<Set<DocSlug> | null> {
    const snapshot = patches;
    const saved = new Set<DocSlug>();
    const failures: DocErrors = {};
    let failure: string | null = null;

    for (const [doc, docPatches] of Object.entries(snapshot) as Array<[DocSlug, Record<string, unknown>]>) {
      const result = await saveInlineDraft(doc, Object.entries(docPatches).map(([path, patch]) => ({ path, value: patch })));
      if (result.ok) saved.add(doc);
      else {
        failures[doc] = result.errors ?? {};
        failure = result.message;
      }
    }

    let seoSaved = false;
    if (workingSeo && slug) {
      const result = await saveDraft(slug, "seo", workingSeo);
      if (result.ok) seoSaved = true;
      else {
        setSeoErrors(result.errors ?? {});
        setSeoOpen(true);
        failure = result.message;
      }
    }

    startTransition(() => {
      setPatches((current) => {
        const next = { ...current };
        for (const doc of saved) if (current[doc] === snapshot[doc]) delete next[doc];
        return next;
      });
      setErrors(failures);
      if (seoSaved) {
        setSeoEdit(null);
        setSeoErrors({});
      }
      router.refresh();
    });
    setStatusVersion((version) => version + 1);

    if (failure) {
      const invalid = Object.values(failures).flatMap((docErrors) => Object.keys(docErrors ?? {}));
      setFlash({ ok: false, text: invalid.length ? `${failure} Fields outlined in red need attention.` : failure });
      return null;
    }
    if (seoSaved) saved.add(slug!);
    return saved;
  }

  function run(task: () => Promise<void>) {
    startTransition(async () => {
      try {
        await task();
      } catch {
        setFlash({ ok: false, text: "Something went wrong. Check your connection and try again." });
      }
    });
  }

  const saveAll = () =>
    run(async () => {
      const saved = await persist();
      if (saved) setFlash({ ok: true, text: saved.size ? "Draft saved. Visitors still see the live version." : "Nothing new to save." });
    });

  const publish = () =>
    run(async () => {
      const saved = await persist();
      if (!saved || !slug) return;
      const results: CmsResult[] = [];
      if (canEditContent) {
        const siteDraft = saved.has("site") || pageStatus?.siteHasContentDraft;
        results.push(await publishDoc(slug, ["content", "seo"]));
        if (siteDraft) results.push(await publishDoc("site", ["content"]));
      } else {
        results.push(await publishDoc(slug, ["seo"]));
      }
      const failed = results.find((result) => !result.ok);
      setFlash(failed ? { ok: false, text: failed.message } : { ok: true, text: "Published. Your changes are live." });
      startTransition(() => router.refresh());
      setStatusVersion((version) => version + 1);
    });

  const discard = () => {
    const hasServerDrafts = Boolean(
      pageStatus && ((canEditContent && (pageStatus.hasContentDraft || pageStatus.siteHasContentDraft)) || pageStatus.hasSeoDraft),
    );
    const message = hasServerDrafts
      ? `Discard all unpublished changes to ${target?.label ?? "this page"}${canEditContent && pageStatus?.siteHasContentDraft ? " and the site-wide header/footer" : ""}? This can't be undone.`
      : "Discard your unsaved edits?";
    if (!window.confirm(message)) return;
    run(async () => {
      if (hasServerDrafts && slug && pageStatus) {
        if (canEditContent && pageStatus.hasContentDraft) await discardDraft(slug, "content");
        if (canEditContent && pageStatus.siteHasContentDraft) await discardDraft("site", "content");
        if (pageStatus.hasSeoDraft) await discardDraft(slug, "seo");
      }
      startTransition(() => {
        setPatches({});
        setErrors({});
        setSeoEdit(null);
        setSeoErrors({});
        router.refresh();
      });
      setStatusVersion((version) => version + 1);
      setFlash({ ok: true, text: "Changes discarded. Showing the live version." });
    });
  };

  const exit = () => {
    if (unsaved > 0 && !window.confirm("You have unsaved edits. Exit without saving?")) return;
    exitForm.current?.requestSubmit();
  };

  const hasDrafts = Boolean(
    pageStatus && ((canEditContent && (pageStatus.hasContentDraft || pageStatus.siteHasContentDraft)) || pageStatus.hasSeoDraft),
  );
  const score =
    currentSeo && pageStatus
      ? auditPageSeo({
          seo: currentSeo,
          title: currentSeo.meta_title || pageStatus.fallbackTitle,
          description: currentSeo.meta_description || pageStatus.fallbackDescription,
          hasFaqs: pageStatus.hasFaqs,
        }).score
      : null;

  return (
    <EditModeContext value={value}>
      {children}
      {!inAdmin && (
        <>
          <div aria-hidden className="h-24" />
          {openSection && (
            <SectionDrawer
              target={openSection}
              patches={patches}
              errors={errors}
              onChange={(next) => setValue(openSection.bind, next, openSection.value)}
              onClose={() => setSection(null)}
            />
          )}
          {seoOpen && showSeo && slug && currentSeo && pageStatus && (
            <SeoDrawer
              slug={slug}
              path={PAGES[slug].path}
              seo={currentSeo}
              errors={seoErrors}
              fallbackTitle={pageStatus.fallbackTitle}
              fallbackDescription={pageStatus.fallbackDescription}
              hasFaqs={pageStatus.hasFaqs}
              onChange={(seo) => setSeoEdit({ slug, seo })}
              onClose={() => setSeoOpen(false)}
            />
          )}

          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex flex-col items-center gap-2 px-3">
            {flash && (
              <p
                role="status"
                className={cn(
                  "pointer-events-auto max-w-xl rounded-full px-4 py-2 text-center text-xs font-semibold shadow-xl",
                  flash.ok ? "bg-success/15 text-success ring-1 ring-success/30" : "bg-danger/15 text-danger ring-1 ring-danger/30",
                  "backdrop-blur",
                )}
              >
                {flash.text}
              </p>
            )}
            <div
              role="toolbar"
              aria-label="Page editor"
              className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-line bg-charcoal/95 p-1.5 pl-3 text-xs shadow-float backdrop-blur"
            >
              <span className="flex shrink-0 items-center gap-2 pr-1 font-semibold text-fg">
                <PencilRuler aria-hidden className="size-4 text-gold" />
                <span className="hidden sm:inline">{target?.label ?? "Site-wide"}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                  unsaved ? "bg-accent/15 text-gold" : hasDrafts ? "bg-fg/10 text-fg" : "bg-success/15 text-success",
                )}
              >
                {unsaved ? `${unsaved} unsaved` : hasDrafts ? "Draft" : "Live"}
              </span>

              {showSeo && (
                <button
                  type="button"
                  onClick={() => {
                    setSection(null);
                    setSeoOpen((open) => !open);
                  }}
                  aria-pressed={seoOpen}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 font-semibold text-fg hover:bg-fg/5"
                >
                  {score === null ? <Search className="size-4" /> : <ScoreRing score={score} size={26} />}
                  SEO
                </button>
              )}

              <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-line" />

              {(unsaved > 0 || hasDrafts) && (
                <DockButton onClick={discard} disabled={busy} label="Discard">
                  <Undo2 className="size-4" />
                </DockButton>
              )}
              <DockButton onClick={saveAll} disabled={busy || unsaved === 0} label="Save draft">
                <Save className="size-4" />
              </DockButton>
              {target && (
                <button
                  type="button"
                  onClick={publish}
                  disabled={busy || (unsaved === 0 && !hasDrafts)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 font-bold text-on-accent hover:bg-accent-2 disabled:opacity-40"
                >
                  {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {canEditContent ? "Publish" : "Publish SEO"}
                </button>
              )}

              <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-line" />
              <a
                href={target ? `/admin/pages/${target.slug}` : "/admin/settings"}
                title="Open in admin"
                aria-label="Open in admin"
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
              >
                <ExternalLink className="size-4" />
              </a>
              <form ref={exitForm} action="/api/admin/edit-mode" method="post" className="contents">
                <input type="hidden" name="mode" value="exit" />
                <input type="hidden" name="path" value={pathname} />
                <DockButton onClick={exit} label="Exit">
                  <LogOut className="size-4" />
                </DockButton>
              </form>
            </div>
          </div>
        </>
      )}
    </EditModeContext>
  );
}

function DockButton({ onClick, disabled, label, children }: { onClick: () => void; disabled?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 font-semibold text-fg hover:bg-fg/5 disabled:opacity-40"
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
