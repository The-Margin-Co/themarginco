import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/layout/Logo";
import { FormBanner } from "@/components/ui/FormField";
import { safeAdminPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> Back to website
        </Link>

        <div className="card p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <div className="leading-none">
              <p className="font-display text-lg font-extrabold text-fg">Margin CMS</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Content studio</p>
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm">Manage and publish articles for The Margin Co blog.</p>

          {!configured && (
            <div className="mt-6">
              <FormBanner tone="info">
                Supabase isn&apos;t configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.
              </FormBanner>
            </div>
          )}

          <div className="mt-8">
            <LoginForm next={safeAdminPath(next)} disabled={!configured} />
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs">
            <ShieldCheck aria-hidden className="size-4 text-gold" />
            Access is limited to approved admin accounts.
          </p>
        </div>
      </div>
    </main>
  );
}
