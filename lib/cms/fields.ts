import { z } from "zod";
import { ICON_NAMES } from "@/lib/cms/icons";
import { isMediaUrl } from "@/lib/media";

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "icon"
  | "toggle"
  | "number"
  | "list"
  | "group"
  | "section";

export type FieldMeta = {
  kind: FieldKind;
  label: string;
  help?: string;
  max?: number;
  min?: number;
  step?: number;
  itemLabel?: string;
  hideable?: boolean;
};

// Every builder attaches FieldMeta via zod's registry, so one schema drives validation,
// the admin form and the inline editor.
const withMeta = <S extends z.ZodType>(schema: S, meta: FieldMeta) => schema.meta(meta);

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export const field = {
  text: (label: string, { max = 160, help }: { max?: number; help?: string } = {}) =>
    withMeta(z.string().trim().max(max), { kind: "text", label, max, help }),

  textarea: (label: string, { max = 600, help }: { max?: number; help?: string } = {}) =>
    withMeta(z.string().trim().max(max), { kind: "textarea", label, max, help }),

  url: (label: string, { help }: { help?: string } = {}) =>
    withMeta(
      z.string().trim().max(500).refine((href) => href === "" || SAFE_HREF.test(href), "Use https://, mailto:, tel: or a /path."),
      { kind: "url", label, help },
    ),

  image: (label: string, { help }: { help?: string } = {}) =>
    withMeta(z.string().trim().refine((url) => url === "" || isMediaUrl(url), "Upload the image with the uploader."), {
      kind: "image",
      label,
      help,
    }),

  icon: (label = "Icon") => withMeta(z.enum(ICON_NAMES), { kind: "icon", label }),

  toggle: (label: string, { help }: { help?: string } = {}) => withMeta(z.boolean(), { kind: "toggle", label, help }),

  number: (label: string, { min = 0, max = 1_000_000, step = 1 }: { min?: number; max?: number; step?: number } = {}) =>
    withMeta(z.number().min(min).max(max), { kind: "number", label, min, max, step }),

  list: <T extends z.ZodType>(
    label: string,
    item: T,
    { max = 20, min = 0, itemLabel = "Item" }: { max?: number; min?: number; itemLabel?: string } = {},
  ) => withMeta(z.array(item).min(min).max(max), { kind: "list", label, itemLabel, min, max }),

  group: <Shape extends z.ZodRawShape>(label: string, shape: Shape) =>
    withMeta(z.object(shape), { kind: "group", label }),

  /** A page section editors can hide. */
  section: <Shape extends z.ZodRawShape>(label: string, shape: Shape) =>
    withMeta(z.object({ visible: z.boolean(), ...shape }), { kind: "section", label, hideable: true }),

  /** A page section that is always shown (e.g. the hero). */
  block: <Shape extends z.ZodRawShape>(label: string, shape: Shape) =>
    withMeta(z.object(shape), { kind: "section", label, hideable: false }),
};

export function fieldMeta(schema: z.ZodType): FieldMeta | undefined {
  return schema.meta() as FieldMeta | undefined;
}

// Walks a schema along a dot path, stepping into objects and list items.
export function schemaAt(schema: z.ZodType, path: string): z.ZodType | undefined {
  if (!path) return schema;
  let node: z.ZodType | undefined = schema;
  for (const key of path.split(".")) {
    if (!node) return undefined;
    if (node instanceof z.ZodObject) node = Object.hasOwn(node.shape, key) ? (node.shape[key] as z.ZodType) : undefined;
    else if (node instanceof z.ZodArray) node = node.element as z.ZodType;
    else return undefined;
  }
  return node;
}

// Section headings, shared across many sections.
export const headingFields = () => ({
  eyebrow: field.text("Eyebrow label", { max: 60 }),
  title: field.text("Heading", { max: 120 }),
  highlight: field.text("Heading highlight (yellow)", { max: 80 }),
});

export const heading = () => ({
  ...headingFields(),
  description: field.textarea("Intro text", { max: 400 }),
});

export const faqItems = (label = "Questions") =>
  field.list(
    label,
    z.object({
      question: field.text("Question", { max: 200 }),
      answer: field.textarea("Answer", { max: 1200 }),
    }),
    { max: 30, itemLabel: "Question" },
  );

export const processSteps = () =>
  field.list(
    "Steps",
    z.object({
      title: field.text("Step title", { max: 80 }),
      description: field.textarea("Description", { max: 300 }),
      deliverables: field.list("Deliverables", field.text("Deliverable", { max: 60 }), { max: 6, itemLabel: "Deliverable" }),
    }),
    { min: 1, max: 6, itemLabel: "Step" },
  );
