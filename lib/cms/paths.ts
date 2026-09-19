// Dot paths address fields inside a CMS document, e.g. "faq.items.2.question".
type Json = unknown;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getAt(source: Json, path: string): unknown {
  if (!path) return source;
  return path.split(".").reduce<unknown>((node, key) => {
    if (Array.isArray(node)) return node[Number(key)];
    if (isPlainObject(node)) return node[key];
    return undefined;
  }, source);
}

export function setAt<T>(source: T, path: string, value: unknown): T {
  if (!path) return value as T;
  const [head, ...rest] = path.split(".");
  const tail = rest.join(".");
  if (Array.isArray(source)) {
    const copy = [...source];
    copy[Number(head)] = setAt(copy[Number(head)], tail, value);
    return copy as T;
  }
  const base: Record<string, unknown> = isPlainObject(source) ? source : {};
  return { ...base, [head]: setAt(base[head], tail, value) } as T;
}

// Objects merge key by key; arrays and scalars from `override` replace the default wholesale.
export function deepMerge<T>(defaults: T, override: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(override)) {
    return (override === undefined ? defaults : override) as T;
  }
  const result: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in defaults ? deepMerge((defaults as Record<string, unknown>)[key], value) : value;
  }
  return result as T;
}

export function joinPath(...parts: Array<string | number>) {
  return parts.filter((part) => part !== "").join(".");
}
