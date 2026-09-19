"use client";

import { Globe, Lock, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { inputStyles } from "@/components/ui/FormField";
import { SITE_URL } from "@/lib/site";
import { CHANGE_FREQS, type PageSeo } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import { ImageInput, TextArea, TextInput, Toggle } from "./inputs";

type Errors = Record<string, string>;

const ROBOTS = [
  { index: true, follow: true, label: "Index, follow", note: "Recommended" },
  { index: true, follow: false, label: "Index, nofollow", note: "Don't pass link equity" },
  { index: false, follow: true, label: "Noindex, follow", note: "Hide from Google" },
  { index: false, follow: false, label: "Noindex, nofollow", note: "Hide completely" },
];

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function LengthMeter({ length, ideal, max }: { length: number; ideal: [number, number]; max: number }) {
  const tone = length === 0 ? "text-zinc-500" : length >= ideal[0] && length <= ideal[1] ? "text-success" : length <= max ? "text-gold" : "text-danger";
  return (
    <span className={cn("text-xs tabular-nums", tone)}>
      {length}/{ideal[1]}
    </span>
  );
}

export function PageSeoFields({
  seo,
  onChange,
  errors = {},
  path,
  fallbackTitle,
  fallbackDescription,
  showFaqToggle,
  imageFallback = "",
}: {
  seo: PageSeo;
  onChange: (seo: PageSeo) => void;
  errors?: Errors;
  /** Public path of the page, e.g. "/services/meta-ads". */
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  showFaqToggle: boolean;
  /** Image used for sharing when no social image is set (e.g. a post's featured image). */
  imageFallback?: string;
}) {
  const set = <K extends keyof PageSeo>(key: K, value: PageSeo[K]) => onChange({ ...seo, [key]: value });
  const [lang, setLang] = useState("");
  const [langHref, setLangHref] = useState("");
  const host = new URL(SITE_URL).host;
  const crumbs = [host, ...path.split("/").filter(Boolean)].join(" › ");
  const title = seo.meta_title || fallbackTitle;
  const description = seo.meta_description || fallbackDescription;
  const langValid = /^([a-z]{2,3}(-[A-Za-z]{2,4})?)$/.test(lang.trim());

  return (
    <div className="space-y-8">
      <FormSection title="Search listing" description="What Google shows for this page.">
        <div>
          <div className="mb-1.5 flex justify-between">
            <span className="text-sm font-medium text-fg">Meta title</span>
            <LengthMeter length={title.length} ideal={[30, 60]} max={70} />
          </div>
          <input
            aria-label="Meta title"
            value={seo.meta_title}
            onChange={(event) => set("meta_title", event.target.value)}
            placeholder={fallbackTitle}
            className={inputStyles(Boolean(errors.meta_title), "py-2.5")}
          />
          {errors.meta_title && <p className="mt-1 text-xs text-danger">{errors.meta_title}</p>}
        </div>
        <div>
          <div className="mb-1.5 flex justify-between">
            <span className="text-sm font-medium text-fg">Meta description</span>
            <LengthMeter length={description.length} ideal={[120, 160]} max={170} />
          </div>
          <textarea
            aria-label="Meta description"
            rows={3}
            value={seo.meta_description}
            onChange={(event) => set("meta_description", event.target.value)}
            placeholder={fallbackDescription}
            className={inputStyles(Boolean(errors.meta_description), "resize-y py-2.5")}
          />
          {errors.meta_description && <p className="mt-1 text-xs text-danger">{errors.meta_description}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Meta keywords"
            help="Comma separated."
            error={errors.meta_keywords}
            value={seo.meta_keywords}
            max={255}
            onChange={(value) => set("meta_keywords", value)}
          />
          <TextInput
            label="Focus keyword"
            help="The main phrase this page should rank for."
            error={errors.focus_keyword}
            value={seo.focus_keyword}
            max={80}
            onChange={(value) => set("focus_keyword", value)}
          />
        </div>

        <div className="rounded-xl border border-line bg-[#202124] p-4 font-[Arial,sans-serif]">
          <div className="flex items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-[#303134] text-[#DADCE0]">
              <Globe aria-hidden className="size-3.5" />
            </span>
            <span className="min-w-0 truncate text-xs text-[#BDC1C6]">https://{crumbs}</span>
          </div>
          <p className="mt-2 text-xl leading-snug text-[#8AB4F8]">{clip(title, 62)}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#BDC1C6]">{clip(description, 160)}</p>
        </div>
      </FormSection>

      <FormSection title="Indexing" description="Control whether and how search engines crawl this page.">
        <div className="grid gap-2 sm:grid-cols-2">
          {ROBOTS.map((option) => {
            const active = seo.robots.index === option.index && seo.robots.follow === option.follow;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => set("robots", { index: option.index, follow: option.follow })}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  active ? "border-accent bg-accent/10" : "border-line hover:border-zinc-600",
                )}
              >
                <span className={cn("block text-sm font-semibold", active ? "text-gold" : "text-fg")}>{option.label}</span>
                <span className="text-xs text-muted">{option.note}</span>
              </button>
            );
          })}
        </div>
        {!seo.robots.index && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-fg">This page will be removed from Google and from the sitemap.</p>
        )}
        <TextInput
          label="Canonical URL"
          help="Leave blank to use this page's own URL."
          error={errors.canonical}
          value={seo.canonical}
          placeholder={path}
          onChange={(value) => set("canonical", value)}
        />
      </FormSection>

      <FormSection title="Languages (hreflang)" description="Tell Google which language this page is in. x-default is added automatically.">
        <div className="flex flex-wrap items-center gap-2">
          {seo.hreflang.map((entry, index) => {
            const locked = entry.lang === "en";
            return (
              <span key={`${entry.lang}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-gold">
                {entry.lang}
                {entry.href && <span className="font-normal text-gold/70">→ {entry.href}</span>}
                {locked ? (
                  <Lock aria-label="Required" className="size-3" />
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${entry.lang}`}
                    onClick={() => set("hreflang", seo.hreflang.filter((_, i) => i !== index))}
                    className="grid size-5 place-items-center rounded-full hover:bg-accent/20"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
            x-default <Lock aria-label="Automatic" className="size-3" />
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <input
            aria-label="Language code"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            placeholder="e.g. en-GB, ar"
            className={inputStyles(false, "w-36 py-2")}
          />
          <input
            aria-label="Alternate URL"
            value={langHref}
            onChange={(event) => setLangHref(event.target.value)}
            placeholder="URL for that language (optional)"
            className={inputStyles(false, "min-w-0 flex-1 py-2")}
          />
          <button
            type="button"
            disabled={!langValid || seo.hreflang.some((entry) => entry.lang === lang.trim())}
            onClick={() => {
              set("hreflang", [...seo.hreflang, { lang: lang.trim(), href: langHref.trim() }]);
              setLang("");
              setLangHref("");
            }}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg hover:border-accent/60 hover:text-gold disabled:opacity-40"
          >
            <Plus aria-hidden className="size-3.5" /> Add language
          </button>
        </div>
        {errors.hreflang && <p className="text-xs text-danger">{errors.hreflang}</p>}
      </FormSection>

      <FormSection title="Social sharing" description="How the page looks on LinkedIn, Facebook, X and WhatsApp.">
        <TextInput label="Social title" help="Defaults to the meta title." value={seo.og_title} max={95} onChange={(value) => set("og_title", value)} />
        <TextArea label="Social description" help="Defaults to the meta description." value={seo.og_description} max={200} onChange={(value) => set("og_description", value)} />
        <ImageInput
          label="Social image (1200×630)"
          help={imageFallback ? "Leave empty to use the featured image." : "Leave empty to use the auto-generated branded card."}
          error={errors.og_image}
          value={seo.og_image}
          onChange={(value) => set("og_image", value)}
        />
        <div className="overflow-hidden rounded-xl border border-line bg-ink">
          <div className="relative aspect-[1200/630] bg-charcoal">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic preview of the generated card */}
            {seo.og_image || imageFallback ? <Image src={seo.og_image || imageFallback} alt="" fill sizes="36rem" className="object-cover" /> : <img src={`/og?title=${encodeURIComponent(seo.og_title || title)}`} alt="" className="size-full object-cover" />}
          </div>
          <div className="border-t border-line p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted">{host}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-fg">{seo.og_title || title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs">{seo.og_description || description}</p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Sitemap & rich results">
        <Toggle label="Include in sitemap.xml" checked={seo.sitemap.include} onChange={(value) => set("sitemap", { ...seo.sitemap, include: value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-medium text-fg">Priority</span>
              <span className="tabular-nums text-gold">{seo.sitemap.priority.toFixed(1)}</span>
            </div>
            <input
              type="range"
              aria-label="Sitemap priority"
              min={0}
              max={1}
              step={0.1}
              value={seo.sitemap.priority}
              onChange={(event) => set("sitemap", { ...seo.sitemap, priority: Number(event.target.value) })}
              className="w-full accent-accent"
            />
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-fg">Change frequency</span>
            <select
              value={seo.sitemap.changefreq}
              onChange={(event) => set("sitemap", { ...seo.sitemap, changefreq: event.target.value as PageSeo["sitemap"]["changefreq"] })}
              className={inputStyles(false, "py-2.5 capitalize")}
            >
              {CHANGE_FREQS.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </label>
        </div>
        {showFaqToggle && (
          <Toggle
            label="Generate FAQ schema"
            help="Adds FAQPage structured data from this page's FAQ section (eligible for FAQ rich results)."
            checked={seo.faq_schema}
            onChange={(value) => set("faq_schema", value)}
          />
        )}
      </FormSection>
    </div>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="font-sans text-sm font-semibold text-fg">{title}</h3>
      {description && <p className="mt-0.5 text-xs">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
