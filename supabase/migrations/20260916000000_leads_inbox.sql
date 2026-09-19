-- Admin leads inbox: a "handled" flag plus the update/delete policies needed to manage it.
-- Until now `leads` only had INSERT (public) and SELECT (admin) policies.

alter table public.leads add column handled boolean not null default false;

create index leads_handled_created_at_idx on public.leads (handled, created_at desc);

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete leads"
  on public.leads for delete
  to authenticated
  using ((select public.is_admin()));

grant update, delete on public.leads to authenticated;
