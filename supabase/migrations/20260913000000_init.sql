-- The Margin Co: initial schema
-- Tables: posts (blog), leads (contact form), admins (CMS allowlist)
-- Security model: the app only ever uses the anon key; Row Level Security does the gatekeeping.

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies on purpose: only the SQL editor / service role can manage admins.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 3 and 160),
  slug       text not null unique
               check (char_length(slug) between 3 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt    text not null check (char_length(excerpt) between 10 and 300),
  content    text not null check (char_length(content) >= 50),
  category   text not null check (char_length(category) between 2 and 40),
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Posts are publicly readable"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "Admins can create posts"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Contact form leads
-- ---------------------------------------------------------------------------
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 100),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  service    text not null check (service in ('meta-ads', 'facebook-ads', 'website-development', 'not-sure')),
  message    text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read leads"
  on public.leads for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Table privileges (defence in depth on top of RLS)
-- ---------------------------------------------------------------------------
revoke all on public.admins, public.posts, public.leads from anon, authenticated;

grant select on public.posts to anon, authenticated;
grant insert on public.posts to authenticated;

grant insert on public.leads to anon, authenticated;
grant select on public.leads to authenticated;
