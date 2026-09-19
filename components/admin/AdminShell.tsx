import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/login/actions";
import type { StaffRole } from "@/lib/auth";
import { LogoMark } from "@/components/layout/Logo";
import { AdminNav } from "./AdminNav";

export function AdminShell({
  email,
  role = "admin",
  title,
  description,
  actions,
  children,
}: {
  email: string;
  role?: StaffRole;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-4 lg:py-6">
          <Link href="/admin/pages" className="flex items-center gap-2.5 rounded-lg">
            <LogoMark className="size-8" />
            <span className="leading-none">
              <span className="block font-display text-sm font-extrabold text-fg">Margin CMS</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Content studio
              </span>
            </span>
          </Link>
        </div>

        <AdminNav role={role} />

        <div className="mt-auto hidden border-t border-line p-4 lg:block">
          <p className="text-xs">Signed in as · {role === "admin" ? "Admin" : "SEO editor"}</p>
          <p className="truncate text-sm font-medium text-fg" title={email}>
            {email}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/85 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            {description && <p className="truncate text-sm">{description}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {actions && <div className="flex items-center gap-2">{actions}</div>}
            <form action={signOut}>
              <button
                type="submit"
                className="flex h-9 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-fg transition-colors hover:border-accent/60 hover:text-gold"
              >
                <LogOut aria-hidden className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
