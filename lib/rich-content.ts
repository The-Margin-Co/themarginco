// Shared by the admin editor and the public post page so the editor is truly WYSIWYG.
export const RICH_CONTENT_CLASS = [
  "prose dark:prose-invert max-w-none",
  "prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-tight",
  "prose-p:text-fg/80 prose-li:text-fg/80 prose-strong:text-fg",
  "prose-a:font-medium prose-a:text-gold prose-a:no-underline hover:prose-a:underline",
  "prose-blockquote:border-l-accent prose-blockquote:text-fg prose-blockquote:not-italic",
  "prose-code:rounded prose-code:bg-charcoal prose-code:px-1.5 prose-code:py-0.5 prose-code:text-gold prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:border prose-pre:border-line prose-pre:bg-charcoal",
  "prose-hr:border-line prose-li:marker:text-gold prose-img:rounded-2xl prose-th:text-fg",
  "prose-table:overflow-hidden prose-th:border prose-th:border-line prose-th:bg-charcoal prose-th:px-3 prose-td:border prose-td:border-line prose-td:px-3",
].join(" ");
