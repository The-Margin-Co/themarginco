"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EditPill } from "@/components/cms/edit/EditPill";

// The CMS has its own shell, so the marketing header and footer only wrap public pages.
export function SiteChrome({
  header,
  footer,
  editing = false,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  /** Inline editor active: the edit dock replaces the "Edit this page" pill. */
  editing?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
      {!editing && <EditPill />}
    </>
  );
}
