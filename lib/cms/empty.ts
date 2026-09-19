import { z } from "zod";

/** A blank value shaped like the schema, used when an editor adds a new list item. */
export function emptyFor(schema: z.ZodType): unknown {
  if (schema instanceof z.ZodObject) {
    return Object.fromEntries(Object.entries(schema.shape).map(([key, child]) => [key, emptyFor(child as z.ZodType)]));
  }
  if (schema instanceof z.ZodArray) return [];
  if (schema instanceof z.ZodEnum) return schema.options[0];
  if (schema instanceof z.ZodBoolean) return true;
  if (schema instanceof z.ZodNumber) return schema.minValue ?? 0;
  return "";
}
