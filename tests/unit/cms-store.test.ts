import { describe, expect, it } from "vitest";
import { deepMerge, getAt, joinPath, setAt } from "@/lib/cms/paths";
import { countPatches, resolveValue, withPatch } from "@/components/cms/edit/store";

const bind = (path: string) => ({ doc: "home" as const, path });

describe("cms paths", () => {
  it("reads and writes nested values without mutating", () => {
    const source = { faq: { items: [{ q: "A" }, { q: "B" }] } };
    const next = setAt(source, "faq.items.1.q", "B2");
    expect(getAt(next, "faq.items.1.q")).toBe("B2");
    expect(source.faq.items[1].q).toBe("B");
  });
  it("merges objects but replaces arrays", () => {
    expect(deepMerge({ a: { b: 1, c: 2 }, l: [1, 2] }, { a: { b: 9 }, l: [3] })).toEqual({ a: { b: 9, c: 2 }, l: [3] });
  });
  it("joins path parts, skipping empties", () => {
    expect(joinPath("", "hero", 2, "title")).toBe("hero.2.title");
  });
});

describe("inline edit patches", () => {
  it("un-dirties a field that is edited back to its server value", () => {
    let patches = withPatch({}, bind("hero.title"), "New", "Old");
    expect(countPatches(patches)).toBe(1);
    patches = withPatch(patches, bind("hero.title"), "Old", "Old");
    expect(countPatches(patches)).toBe(0);
  });
  it("folds an edit inside an already-patched section into that section's patch", () => {
    let patches = withPatch({}, bind("faq"), { items: [{ q: "A" }] });
    patches = withPatch(patches, bind("faq.items.0.q"), "A2");
    expect(Object.keys(patches.home ?? {})).toEqual(["faq"]);
    expect(resolveValue(patches, bind("faq.items.0.q"), "A")).toBe("A2");
  });
  it("a section patch replaces earlier field patches inside it", () => {
    let patches = withPatch({}, bind("faq.items.1.q"), "B2");
    patches = withPatch(patches, bind("faq"), { items: [] });
    expect(Object.keys(patches.home ?? {})).toEqual(["faq"]);
  });
});
