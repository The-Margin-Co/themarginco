"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import type { z } from "zod";
import { PageSeoFields } from "@/components/admin/cms/PageSeoFields";
import { SchemaForm } from "@/components/admin/cms/SchemaForm";
import { SeoAuditCard } from "@/components/admin/cms/SeoAuditCard";
import { schemaAt } from "@/lib/cms/fields";
import { docSchema, type PageSlug } from "@/lib/cms/registry";
import { auditPageSeo } from "@/lib/seo/audit";
import type { PageSeo } from "@/lib/seo/schema";
import { resolveValue, type DocErrors, type Patches, type SectionTarget } from "./store";

function Drawer({ title, subtitle, onClose, footer, children }: { title: string; subtitle?: string; onClose: () => void; footer?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !(event.target as HTMLElement | null)?.isContentEditable) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      role="dialog"
      aria-label={title}
      className="fixed inset-y-0 right-0 z-[90] flex w-[min(32rem,100vw)] flex-col border-l border-line bg-charcoal text-sm shadow-float"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-sans text-base font-bold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close panel" className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg">
          <X className="size-5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer && <footer className="border-t border-line px-5 py-3">{footer}</footer>}
    </aside>
  );
}

export function SectionDrawer({
  target,
  patches,
  errors,
  onChange,
  onClose,
}: {
  target: SectionTarget;
  patches: Patches;
  errors: DocErrors;
  onChange: (value: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const { bind } = target;
  const schema = schemaAt(docSchema(bind.doc), bind.path) as z.ZodObject | undefined;
  const value = resolveValue(patches, bind, target.value);

  return (
    <Drawer
      title={target.label}
      subtitle={bind.doc === "site" ? "Site-wide: changes apply on every page." : "Changes show on the page as you type."}
      onClose={onClose}
      footer={<p className="text-xs text-muted">Nothing is live until you press Publish in the edit bar.</p>}
    >
      {schema ? (
        <SchemaForm schema={schema} value={value} onChange={onChange} errors={errors[bind.doc] ?? {}} path={bind.path} />
      ) : (
        <p>This section can&apos;t be edited here.</p>
      )}
    </Drawer>
  );
}

export function SeoDrawer({
  slug,
  path,
  seo,
  errors,
  fallbackTitle,
  fallbackDescription,
  hasFaqs,
  onChange,
  onClose,
}: {
  slug: PageSlug;
  path: string;
  seo: PageSeo;
  errors: Record<string, string>;
  fallbackTitle: string;
  fallbackDescription: string;
  hasFaqs: boolean;
  onChange: (seo: PageSeo) => void;
  onClose: () => void;
}) {
  const audit = auditPageSeo({
    seo,
    title: seo.meta_title || fallbackTitle,
    description: seo.meta_description || fallbackDescription,
    hasFaqs,
  });

  return (
    <Drawer
      title="SEO"
      subtitle="Search listing, social sharing, indexing and hreflang for this page."
      onClose={onClose}
      footer={
        <a href={`/admin/pages/${slug}?tab=schema`} className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline">
          Structured data (JSON-LD) and history in the admin <ExternalLink className="size-3" />
        </a>
      }
    >
      <div className="space-y-6">
        <SeoAuditCard audit={audit} compact />
        <PageSeoFields
          seo={seo}
          onChange={onChange}
          errors={errors}
          path={path}
          fallbackTitle={fallbackTitle}
          fallbackDescription={fallbackDescription}
          showFaqToggle={hasFaqs}
        />
      </div>
    </Drawer>
  );
}
