"use client";

import { Plus, Trash2 } from "lucide-react";
import { inputStyles } from "@/components/ui/FormField";
import { SITE_URL } from "@/lib/site";
import type { SiteSeo } from "@/lib/seo/schema";
import { ImageInput, TextArea, TextInput, Toggle } from "./inputs";
import { FormSection } from "./PageSeoFields";

type Errors = Record<string, string>;
type Rule = SiteSeo["robots"]["rules"][number];

const ALWAYS_BLOCKED = ["/admin", "/api"];

function linesToPaths(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Mirrors app/robots.ts so editors see exactly what crawlers will get. */
export function robotsPreview(seo: SiteSeo) {
  const sitemap = new URL("/sitemap.xml", SITE_URL).toString();
  if (seo.robots.discourage) return `User-Agent: *\nDisallow: /\n\nSitemap: ${sitemap}`;
  const rules = seo.robots.rules.map((rule) => ({
    agent: rule.user_agent,
    allow: rule.allow,
    disallow: [...new Set([...rule.disallow, ...ALWAYS_BLOCKED])],
  }));
  if (!rules.some((rule) => rule.agent === "*")) rules.unshift({ agent: "*", allow: ["/"], disallow: ALWAYS_BLOCKED });
  const body = rules
    .map((rule) =>
      [`User-Agent: ${rule.agent}`, ...rule.allow.map((path) => `Allow: ${path}`), ...rule.disallow.map((path) => `Disallow: ${path}`)].join("\n"),
    )
    .join("\n\n");
  return `${body}\n\nHost: ${SITE_URL}\nSitemap: ${sitemap}`;
}

export function SiteSeoFields({ seo, onChange, errors = {} }: { seo: SiteSeo; onChange: (seo: SiteSeo) => void; errors?: Errors }) {
  const set = <K extends keyof SiteSeo>(key: K, value: SiteSeo[K]) => onChange({ ...seo, [key]: value });
  const org = seo.organization;
  const setOrg = (patch: Partial<SiteSeo["organization"]>) => set("organization", { ...org, ...patch });
  const rules = seo.robots.rules;
  const setRules = (next: Rule[]) => set("robots", { ...seo.robots, rules: next });

  return (
    <div className="space-y-6">
      <FormSection title="Defaults" description="Used by any page that doesn't set its own values.">
        <TextInput
          label="Title template"
          help="%s is replaced by the page name, e.g. “About Us | The Margin Co”."
          error={errors.title_template}
          value={seo.title_template}
          max={80}
          onChange={(value) => set("title_template", value)}
        />
        <TextInput label="Default title (home)" error={errors.default_title} value={seo.default_title} max={70} onChange={(value) => set("default_title", value)} />
        <TextArea
          label="Default meta description"
          error={errors.default_description}
          value={seo.default_description}
          max={170}
          onChange={(value) => set("default_description", value)}
        />
        <TextInput label="Default keywords" help="Comma separated." value={seo.default_keywords} max={255} onChange={(value) => set("default_keywords", value)} />
        <ImageInput
          label="Default social image (1200×630)"
          help="Empty = auto-generated branded card with each page's title."
          error={errors.default_og_image}
          value={seo.default_og_image}
          onChange={(value) => set("default_og_image", value)}
        />
      </FormSection>

      <FormSection title="Language & locale">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="HTML lang" help="Sets <html lang>." error={errors.html_lang} value={seo.html_lang} onChange={(value) => set("html_lang", value)} />
          <TextInput label="Open Graph locale" error={errors.og_locale} value={seo.og_locale} onChange={(value) => set("og_locale", value)} />
          <TextInput label="X / Twitter handle" value={seo.twitter_handle} placeholder="@yourhandle" onChange={(value) => set("twitter_handle", value)} />
        </div>
      </FormSection>

      <FormSection title="Organization (Organization schema)" description="Powers the knowledge panel details search engines show for the brand.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Organization name" value={org.name} onChange={(value) => setOrg({ name: value })} />
          <TextInput label="Contact email" value={org.email} onChange={(value) => setOrg({ email: value })} />
          <TextInput label="Phone" value={org.phone} onChange={(value) => setOrg({ phone: value })} />
        </div>
        <ImageInput label="Logo" help="Square PNG/WebP, at least 112×112." error={errors["organization.logo"]} value={org.logo} onChange={(value) => setOrg({ logo: value })} />
        <TextArea
          label="Social profiles (sameAs)"
          help="One https:// URL per line (Instagram, LinkedIn, Facebook…)."
          error={Object.entries(errors).find(([key]) => key.startsWith("organization.same_as"))?.[1]}
          value={org.same_as.join("\n")}
          rows={3}
          onChange={(value) => setOrg({ same_as: linesToPaths(value) })}
        />
      </FormSection>

      <FormSection title="Search console verification">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Google verification code"
            help="Content of the google-site-verification meta tag."
            value={seo.verification.google}
            onChange={(value) => set("verification", { ...seo.verification, google: value })}
          />
          <TextInput
            label="Bing verification code"
            help="Content of the msvalidate.01 meta tag."
            value={seo.verification.bing}
            onChange={(value) => set("verification", { ...seo.verification, bing: value })}
          />
        </div>
      </FormSection>

      <FormSection title="robots.txt" description="/admin and /api are always blocked.">
        <Toggle
          label="Discourage search engines"
          help="Blocks the whole site (use on staging only). Preview deployments are blocked automatically."
          checked={seo.robots.discourage}
          onChange={(value) => set("robots", { ...seo.robots, discourage: value })}
        />
        <ol className="space-y-3">
          {rules.map((rule, index) => (
            <li key={index} className="rounded-xl border border-line p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextInput
                    label="User-agent"
                    value={rule.user_agent}
                    placeholder="* or Googlebot"
                    onChange={(value) => setRules(rules.map((r, i) => (i === index ? { ...r, user_agent: value } : r)))}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove rule"
                  onClick={() => setRules(rules.filter((_, i) => i !== index))}
                  className="grid size-10 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-fg">Allow (one path per line)</span>
                  <textarea
                    rows={3}
                    value={rule.allow.join("\n")}
                    onChange={(event) => setRules(rules.map((r, i) => (i === index ? { ...r, allow: linesToPaths(event.target.value) } : r)))}
                    className={inputStyles(false, "font-mono text-xs")}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-fg">Disallow (one path per line)</span>
                  <textarea
                    rows={3}
                    value={rule.disallow.join("\n")}
                    onChange={(event) => setRules(rules.map((r, i) => (i === index ? { ...r, disallow: linesToPaths(event.target.value) } : r)))}
                    className={inputStyles(false, "font-mono text-xs")}
                  />
                </label>
              </div>
            </li>
          ))}
        </ol>
        {Object.entries(errors).some(([key]) => key.startsWith("robots.")) && (
          <p className="text-xs text-danger">Every path must start with “/”.</p>
        )}
        <button
          type="button"
          disabled={rules.length >= 10}
          onClick={() => setRules([...rules, { user_agent: "*", allow: [], disallow: [] }])}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-line px-3 text-xs font-semibold text-muted hover:border-accent/60 hover:text-gold disabled:opacity-40"
        >
          <Plus aria-hidden className="size-3.5" /> Add rule
        </button>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Preview</p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-ink p-4 font-mono text-xs leading-relaxed text-fg">{robotsPreview(seo)}</pre>
        </div>
      </FormSection>
    </div>
  );
}
