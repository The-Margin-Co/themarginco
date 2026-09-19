"use client";

import { PencilRuler } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

// Supabase keeps the session in readable `sb-<project>-auth-token` cookies. Only signed-in
// team members have one, so visitors never see the pill (and the page stays fully static).
function hasSessionCookie() {
  return document.cookie.split("; ").some((cookie) => /^sb-[^=]+-auth-token(\.\d+)?=/.test(cookie));
}

const noopSubscribe = () => () => {};

export function EditPill() {
  const pathname = usePathname();
  const signedIn = useSyncExternalStore(noopSubscribe, hasSessionCookie, () => false);
  if (!signedIn) return null;

  return (
    <form action="/api/admin/edit-mode" method="post" className="fixed bottom-5 right-5 z-[85]">
      <input type="hidden" name="mode" value="enter" />
      <input type="hidden" name="path" value={pathname} />
      <button
        type="submit"
        className="flex h-11 items-center gap-2 rounded-full border border-accent/40 bg-charcoal/95 px-4 text-sm font-semibold text-gold shadow-float backdrop-blur transition-colors hover:bg-accent hover:text-on-accent"
      >
        <PencilRuler aria-hidden className="size-4" /> Edit this page
      </button>
    </form>
  );
}
