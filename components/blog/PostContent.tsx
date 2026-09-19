import { RICH_CONTENT_CLASS } from "@/lib/rich-content";
import { sanitizePostHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

// Content is sanitized on save and again here, so a bad row can never inject markup.
export function PostContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(RICH_CONTENT_CLASS, "prose-lg", className)}
      dangerouslySetInnerHTML={{ __html: sanitizePostHtml(html) }}
    />
  );
}
