import { isJsonObject, type PageSeo } from "@/lib/seo/schema";

export type AuditStatus = "pass" | "warn" | "fail";
export type AuditCheck = { id: string; label: string; status: AuditStatus; detail: string };
export type AuditResult = { score: number; checks: AuditCheck[] };

type AuditInput = {
  seo: PageSeo;
  /** Title/description the page would actually render (after fallbacks). */
  title: string;
  description: string;
  hasFaqs?: boolean;
  duplicateTitle?: boolean;
  duplicateDescription?: boolean;
};

const WEIGHT: Record<AuditStatus, number> = { pass: 1, warn: 0.5, fail: 0 };

function check(id: string, label: string, status: AuditStatus, detail: string): AuditCheck {
  return { id, label, status, detail };
}

export function auditPageSeo({ seo, title, description, hasFaqs = false, duplicateTitle, duplicateDescription }: AuditInput): AuditResult {
  const checks: AuditCheck[] = [];
  const keyword = seo.focus_keyword.trim().toLowerCase();

  const titleLength = title.length;
  checks.push(
    !seo.meta_title
      ? check("title", "Meta title", "warn", `Using the automatic title (${titleLength} chars). Write one for full control.`)
      : titleLength >= 30 && titleLength <= 60
        ? check("title", "Meta title", "pass", `${titleLength} characters, ideal length.`)
        : check("title", "Meta title", titleLength > 70 ? "fail" : "warn", `${titleLength} characters; aim for 30–60.`),
  );

  const descLength = description.length;
  checks.push(
    !seo.meta_description
      ? check("description", "Meta description", "warn", "Using the default description. Write a unique one for this page.")
      : descLength >= 70 && descLength <= 160
        ? check("description", "Meta description", "pass", `${descLength} characters, ideal length.`)
        : check("description", "Meta description", descLength > 170 ? "fail" : "warn", `${descLength} characters; aim for 120–160.`),
  );

  if (!keyword) {
    checks.push(check("keyword", "Focus keyword", "warn", "Set the main keyword this page should rank for."));
  } else {
    const inTitle = title.toLowerCase().includes(keyword);
    const inDescription = description.toLowerCase().includes(keyword);
    checks.push(
      check(
        "keyword",
        "Focus keyword placement",
        inTitle && inDescription ? "pass" : inTitle || inDescription ? "warn" : "fail",
        inTitle && inDescription
          ? `"${seo.focus_keyword}" appears in the title and description.`
          : `Add "${seo.focus_keyword}" to the ${[!inTitle && "title", !inDescription && "description"].filter(Boolean).join(" and ")}.`,
      ),
    );
  }

  checks.push(
    seo.robots.index
      ? check("index", "Indexing", "pass", "Search engines may index this page.")
      : check("index", "Indexing", "warn", "Set to noindex: this page won't appear in Google."),
  );

  checks.push(
    seo.sitemap.include || !seo.robots.index
      ? check("sitemap", "Sitemap", "pass", seo.sitemap.include ? `Included (priority ${seo.sitemap.priority.toFixed(1)}).` : "Excluded (page is noindex).")
      : check("sitemap", "Sitemap", "warn", "Indexable but excluded from the sitemap."),
  );

  checks.push(
    seo.og_image
      ? check("og", "Social image", "pass", "Custom share image set.")
      : check("og", "Social image", "warn", "Using the auto-generated share card. Upload a 1200×630 image for best results."),
  );

  checks.push(
    seo.hreflang.some((entry) => entry.lang === "en")
      ? check("hreflang", "Language (hreflang)", "pass", `Declared: ${seo.hreflang.map((entry) => entry.lang).join(", ")}, x-default.`)
      : check("hreflang", "Language (hreflang)", "fail", "Add the 'en' language chip."),
  );

  if (hasFaqs) {
    checks.push(
      seo.faq_schema
        ? check("faq", "FAQ rich results", "pass", "FAQPage schema is generated from this page's FAQs.")
        : check("faq", "FAQ rich results", "warn", "This page has FAQs but FAQ schema is turned off."),
    );
  }

  const invalid = seo.schemas.filter((block) => block.enabled && !isJsonObject(block.json));
  checks.push(
    invalid.length
      ? check("schema", "Custom schema", "fail", `${invalid.length} custom schema block(s) contain invalid JSON.`)
      : check("schema", "Custom schema", "pass", seo.schemas.length ? `${seo.schemas.filter((b) => b.enabled).length} custom block(s) valid.` : "Automatic schemas only."),
  );

  if (duplicateTitle !== undefined) {
    checks.push(
      duplicateTitle
        ? check("dup-title", "Unique title", "fail", "Another page uses the same title.")
        : check("dup-title", "Unique title", "pass", "No other page uses this title."),
    );
  }
  if (duplicateDescription !== undefined) {
    checks.push(
      duplicateDescription
        ? check("dup-desc", "Unique description", "fail", "Another page uses the same description.")
        : check("dup-desc", "Unique description", "pass", "No other page uses this description."),
    );
  }

  const score = Math.round((checks.reduce((sum, item) => sum + WEIGHT[item.status], 0) / checks.length) * 100);
  return { score, checks };
}

export function scoreTone(score: number): AuditStatus {
  return score >= 80 ? "pass" : score >= 55 ? "warn" : "fail";
}
