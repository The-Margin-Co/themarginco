-- Adds a per-visitor limit to the contact form. The server action passes a salted hash of the
-- caller's IP (never the raw address); the function allows 5 submissions per hash per hour on
-- top of the existing per-email (3/h) and site-wide (60/h) ceilings.

alter table public.leads add column if not exists ip_hash text;
create index if not exists leads_ip_hash_created_idx on public.leads (ip_hash, created_at);

-- Replace the 4-argument version so nobody can call the old, IP-blind one directly.
drop function if exists public.submit_lead(text, text, text, text);

create or replace function public.submit_lead(
  p_name text,
  p_email text,
  p_service text,
  p_message text,
  p_ip_hash text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_ip text := nullif(trim(p_ip_hash), '');
  v_from_email int;
  v_from_ip int;
  v_total int;
begin
  select count(*) into v_from_email
    from public.leads
   where lower(email) = v_email and created_at > now() - interval '1 hour';
  if v_from_email >= 3 then
    raise exception 'Too many submissions. Please email us instead.' using errcode = 'P0001';
  end if;

  if v_ip is not null then
    select count(*) into v_from_ip
      from public.leads
     where ip_hash = v_ip and created_at > now() - interval '1 hour';
    if v_from_ip >= 5 then
      raise exception 'Too many submissions. Please email us instead.' using errcode = 'P0001';
    end if;
  end if;

  select count(*) into v_total from public.leads where created_at > now() - interval '1 hour';
  if v_total >= 60 then
    raise exception 'Too many submissions. Please email us instead.' using errcode = 'P0001';
  end if;

  insert into public.leads (name, email, service, message, ip_hash)
  values (trim(p_name), v_email, p_service, trim(p_message), v_ip);
end;
$$;

revoke all on function public.submit_lead(text, text, text, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text, text) to anon, authenticated;
