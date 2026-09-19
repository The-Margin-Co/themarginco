"use client";

import { createContext, useContext } from "react";
import type { StaffRole } from "@/lib/auth";
import { getAt, setAt } from "@/lib/cms/paths";
import type { DocSlug } from "@/lib/cms/registry";
import type { Bind } from "../Editable";

/**
 * Unsaved inline edits: doc → (dot path → value). Paths within a doc never overlap:
 * editing a field inside an already-patched section updates that section's patch instead.
 */
export type Patches = Partial<Record<DocSlug, Record<string, unknown>>>;
export type DocErrors = Partial<Record<DocSlug, Record<string, string>>>;

export type SectionTarget = { bind: Bind; label: string; value: Record<string, unknown> };

export type EditModeValue = {
  role: StaffRole;
  canEditContent: boolean;
  patches: Patches;
  errors: DocErrors;
  /** Stores an edit. Pass the published/draft value so reverting a field un-dirties it. */
  setValue: (bind: Bind, value: unknown, serverValue?: unknown) => void;
  openSection: (target: SectionTarget) => void;
  /** Keeps an open section panel in step with fresh server data after a save or refresh. */
  syncSection: (bind: Bind, value: Record<string, unknown>) => void;
};

export const EditModeContext = createContext<EditModeValue | null>(null);

export function useEditMode() {
  return useContext(EditModeContext);
}

function isUnder(path: string, parent: string) {
  return parent === "" || path.startsWith(`${parent}.`);
}

/** The value a field shows right now: the server value with any pending edits applied. */
export function resolveValue<T>(patches: Patches, bind: Bind, serverValue: T): T {
  const doc = patches[bind.doc];
  if (!doc) return serverValue;
  if (bind.path in doc) return doc[bind.path] as T;
  for (const [path, value] of Object.entries(doc)) {
    if (isUnder(bind.path, path)) return getAt(value, bind.path.slice(path ? path.length + 1 : 0)) as T;
  }
  let result: unknown = serverValue;
  for (const [path, value] of Object.entries(doc)) {
    if (path !== bind.path && isUnder(path, bind.path)) result = setAt(result, path.slice(bind.path ? bind.path.length + 1 : 0), value);
  }
  return result as T;
}

export function withPatch(patches: Patches, bind: Bind, value: unknown, serverValue?: unknown): Patches {
  const doc = { ...(patches[bind.doc] ?? {}) };
  const ancestor = Object.keys(doc).find((path) => path !== bind.path && isUnder(bind.path, path));

  if (ancestor !== undefined) {
    doc[ancestor] = setAt(doc[ancestor], bind.path.slice(ancestor ? ancestor.length + 1 : 0), value);
  } else {
    for (const path of Object.keys(doc)) if (path !== bind.path && isUnder(path, bind.path)) delete doc[path];
    if (serverValue !== undefined && JSON.stringify(value) === JSON.stringify(serverValue)) delete doc[bind.path];
    else doc[bind.path] = value;
  }

  const next = { ...patches };
  if (Object.keys(doc).length > 0) next[bind.doc] = doc;
  else delete next[bind.doc];
  return next;
}

export function countPatches(patches: Patches) {
  return Object.values(patches).reduce((total, doc) => total + Object.keys(doc ?? {}).length, 0);
}
