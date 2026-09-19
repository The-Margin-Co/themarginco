import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { iconFor } from "@/lib/cms/icons";

/** Renders an icon stored in the CMS by name. */
export function CmsIcon({ name, ...props }: LucideProps & { name: string }) {
  return createElement(iconFor(name), { "aria-hidden": true, ...props });
}
