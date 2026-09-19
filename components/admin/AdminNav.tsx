"use client";

import {
  ChartColumn,
  ExternalLink,
  FileText,
  Globe,
  Inbox,
  LayoutTemplate,
  SearchCheck,
  Settings,
  SquarePen,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StaffRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; roles: StaffRole[]; isActive: (path: string) => boolean };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Website",
    items: [
      {
        href: "/admin/pages",
        label: "Pages",
        icon: LayoutTemplate,
        roles: ["admin", "seo_editor"],
        isActive: (path) => path.startsWith("/admin/pages"),
      },
      { href: "/admin/seo", label: "SEO", icon: SearchCheck, roles: ["admin", "seo_editor"], isActive: (path) => path === "/admin/seo" },
      { href: "/admin/settings", label: "Site settings", icon: Settings, roles: ["admin"], isActive: (path) => path === "/admin/settings" },
    ],
  },
  {
    title: "Blog",
    items: [
      {
        href: "/admin/blog",
        label: "All posts",
        icon: FileText,
        roles: ["admin", "seo_editor"],
        isActive: (path) => path === "/admin/blog" || (path.startsWith("/admin/blog/") && path !== "/admin/blog/new"),
      },
      { href: "/admin/blog/new", label: "New post", icon: SquarePen, roles: ["admin"], isActive: (path) => path === "/admin/blog/new" },
    ],
  },
  {
    title: "Case Studies",
    items: [
      {
        href: "/admin/case-studies",
        label: "All case studies",
        icon: ChartColumn,
        roles: ["admin", "seo_editor"],
        isActive: (path) =>
          path === "/admin/case-studies" || (path.startsWith("/admin/case-studies/") && path !== "/admin/case-studies/new"),
      },
      {
        href: "/admin/case-studies/new",
        label: "New case study",
        icon: SquarePen,
        roles: ["admin"],
        isActive: (path) => path === "/admin/case-studies/new",
      },
    ],
  },
  {
    title: "Video Testimonials",
    items: [
      {
        href: "/admin/video-testimonials",
        label: "All videos",
        icon: Video,
        roles: ["admin"],
        isActive: (path) =>
          path === "/admin/video-testimonials" || (path.startsWith("/admin/video-testimonials/") && path !== "/admin/video-testimonials/new"),
      },
      {
        href: "/admin/video-testimonials/new",
        label: "New video",
        icon: SquarePen,
        roles: ["admin"],
        isActive: (path) => path === "/admin/video-testimonials/new",
      },
    ],
  },
  {
    title: "Leads",
    items: [{ href: "/admin/leads", label: "Leads", icon: Inbox, roles: ["admin"], isActive: (path) => path === "/admin/leads" }],
  },
  {
    title: "Account",
    items: [{ href: "/admin/team", label: "Team", icon: Users, roles: ["admin"], isActive: (path) => path === "/admin/team" }],
  },
];

export function AdminNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();

  return (
    <nav aria-label="CMS" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:pb-4">
      {groups.map((group) => {
        const visible = group.items.filter((item) => item.roles.includes(role));
        if (visible.length === 0) return null;
        return (
          <div key={group.title} className="contents lg:block lg:pb-4">
            <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 lg:block">
              {group.title}
            </p>
            {visible.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-gold" : "text-muted hover:bg-fg/5 hover:text-fg",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-fg/5 hover:text-fg"
      >
        <Globe aria-hidden className="size-4" />
        View website
        <ExternalLink aria-hidden className="ml-auto hidden size-3.5 lg:block" />
      </a>
    </nav>
  );
}
