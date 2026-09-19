import sanitizeHtml from "sanitize-html";
import { isMediaUrl } from "@/lib/media";

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "sub", "sup", "span", "mark", "code", "pre",
    "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "hr", "a", "img",
    "table", "colgroup", "col", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    th: ["colspan", "rowspan", "colwidth"],
    td: ["colspan", "rowspan", "colwidth"],
    col: ["span"],
    "*": ["style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedStyles: {
    "*": {
      color: COLOR,
      "background-color": COLOR,
      "text-align": [/^(left|right|center|justify)$/],
      "font-size": [/^\d{1,2}(\.\d{1,2})?(px|rem|em)$/],
      "font-family": [/^[\w\s,'"-]{1,80}$/],
      "min-width": [/^\d{1,4}px$/],
      width: [/^\d{1,4}px$/],
    },
  },
  transformTags: {
    h1: "h2",
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
      };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
  },
  // Images must come from our own media bucket: no hot-linked third-party hosts (privacy, tracking
  // pixels, and it keeps the Content-Security-Policy's img-src tight), no mixed content, no data URIs.
  exclusiveFilter: (frame) => frame.tag === "img" && !isMediaUrl(frame.attribs.src ?? ""),
};

export function sanitizePostHtml(dirty: string) {
  return sanitizeHtml(dirty, OPTIONS);
}
