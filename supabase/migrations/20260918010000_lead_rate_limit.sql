-- The anon key is public by design, so anyone could POST straight to /rest/v1/leads and skip
-- the server action's honeypot entirely. Close that path: anon loses INSERT on the table and
-- submits through a rate-limited security-definer function instead.

create or replace function public.submit_lead(
  p_name text,
  p_email text,
  p_service text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_from_email int;
  v_total int;
begin
  select count(*) into v_from_email
    from public.leads
   where lower(email) = v_email and created_at > now() - interval '1 hour';
  if v_from_email >= 3 then
    raise exception 'Too many submissions. Please email us instead.' using errcode = 'P0001';
  end if;

  -- Site-wide ceiling so a botnet rotating addresses can't fill the table either.
  select count(*) into v_total from public.leads where created_at > now() - interval '1 hour';
  if v_total >= 60 then
    raise exception 'Too many submissions. Please email us instead.' using errcode = 'P0001';
  end if;

  -- Column CHECK constraints still validate name/email/service/message.
  insert into public.leads (name, email, service, message)
  values (trim(p_name), v_email, p_service, trim(p_message));
end;
$$;

revoke all on function public.submit_lead(text, text, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text) to anon, authenticated;

drop policy "Anyone can submit a lead" on public.leads;
revoke insert on public.leads from anon, authenticated;

-- ---------------------------------------------------------------------------
-- `pages` is world-readable so visitors can render published content, but published_by
-- (a staff user's uuid) doesn't need to be part of that.
-- ---------------------------------------------------------------------------
revoke select on public.pages from anon, authenticated;
grant select (slug, content, seo, content_published_at, seo_published_at, updated_at)
  on public.pages to anon, authenticated;
