import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { LeadHandledToggle } from "@/components/admin/LeadHandledToggle";
import { Badge } from "@/components/ui/Badge";
import { getAdminSession } from "@/lib/auth";
import { SERVICE_OPTIONS } from "@/lib/validation";
import { cn, formatDate } from "@/lib/utils";
import { deleteLead } from "./actions";

export const metadata: Metadata = { title: "Leads" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "handled", label: "Handled" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

const serviceLabel = (value: string) => SERVICE_OPTIONS.find((option) => option.value === value)?.label ?? value;

export default async function AdminLeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/leads" />;

  const params = await searchParams;
  const filter: Filter = params.status === "new" || params.status === "handled" ? params.status : "all";

  const { data, error } = await session.supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load leads: ${error.message}`);

  const counts = {
    all: data.length,
    new: data.filter((lead) => !lead.handled).length,
    handled: data.filter((lead) => lead.handled).length,
  };
  const leads = data.filter(
    (lead) => filter === "all" || (filter === "handled" ? lead.handled : !lead.handled),
  );

  const filterHref = (value: Filter) => (value === "all" ? "/admin/leads" : `/admin/leads?status=${value}`);

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role="admin"
      title="Leads"
      description={`${counts.new} new · ${counts.handled} handled`}
    >
      <nav aria-label="Filter by status" className="flex w-fit gap-1 rounded-full border border-line bg-charcoal p-1">
        {FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={filterHref(value)}
            aria-current={filter === value ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === value ? "bg-accent text-on-accent" : "text-muted hover:text-fg",
            )}
          >
            {label}
            <span className={cn("text-xs", filter === value ? "text-on-accent/70" : "text-zinc-500")}>{counts[value]}</span>
          </Link>
        ))}
      </nav>

      <div className="card mt-5 overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-gold">
              <Inbox aria-hidden className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-bold">{filter === "all" ? "No leads yet" : "No leads match"}</h2>
            <p className="mt-1 text-sm">
              {filter === "all" ? "Submissions from the contact form will show up here." : "Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Contact</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Service</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Message</th>
                  <th scope="col" className="hidden whitespace-nowrap px-4 py-3 font-semibold lg:table-cell">Submitted</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Handled</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-top transition-colors hover:bg-fg/[0.02]">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-fg">{lead.name}</p>
                      <a href={`mailto:${lead.email}`} className="font-mono text-xs text-muted hover:text-gold">
                        {lead.email}
                      </a>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <Badge tone="neutral">{serviceLabel(lead.service)}</Badge>
                    </td>
                    <td className="max-w-md px-4 py-3.5">
                      <p className="line-clamp-2 leading-relaxed">{lead.message}</p>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 lg:table-cell">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <LeadHandledToggle id={lead.id} handled={lead.handled} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <DeletePostButton action={deleteLead.bind(null, lead.id)} title={lead.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
