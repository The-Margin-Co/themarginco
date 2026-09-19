-- Page CMS: editable page content + SEO with drafts, publishing, revisions,
-- and an SEO-editor role. All writes run on the signed-in user's session, so
-- these policies/functions are the real enforcement (no service-role key).

-- ---------------------------------------------------------------------------
-- Staff roles
-- ---------------------------------------------------------------------------
alter table public.admins
  add column role text not null default 'admin' check (role in ('admin', 'seo_editor'));

create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.admins where user_id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.can_edit_seo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()) and role in ('admin', 'seo_editor'));
$$;

revoke all on function public.staff_role() from public;
revoke all on function public.can_edit_seo() from public;
grant execute on function public.staff_role() to anon, authenticated;
grant execute on function public.can_edit_seo() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Published documents ("site" + one row per page), drafts, revisions
-- ---------------------------------------------------------------------------
create table public.pages (
  slug                 text primary key check (slug ~ '^[a-z0-9-]+(/[a-z0-9-]+)*$' and char_length(slug) <= 80),
  content              jsonb check (content is null or (jsonb_typeof(content) = 'object' and pg_column_size(content) < 1000000)),
  seo                  jsonb check (seo is null or (jsonb_typeof(seo) = 'object' and pg_column_size(seo) < 200000)),
  content_published_at timestamptz,
  seo_published_at     timestamptz,
  published_by         uuid references auth.users (id) on delete set null,
  updated_at           timestamptz not null default now()
);

create table public.page_content_drafts (
  slug       text primary key check (slug ~ '^[a-z0-9-]+(/[a-z0-9-]+)*$' and char_length(slug) <= 80),
  content    jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) < 1000000),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

create table public.page_seo_drafts (
  slug       text primary key check (slug ~ '^[a-z0-9-]+(/[a-z0-9-]+)*$' and char_length(slug) <= 80),
  seo        jsonb not null check (jsonb_typeof(seo) = 'object' and pg_column_size(seo) < 200000),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

create table public.page_revisions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  part         text not null check (part in ('content', 'seo')),
  data         jsonb not null,
  published_by uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index page_revisions_slug_idx on public.page_revisions (slug, part, created_at desc);

create trigger page_content_drafts_set_updated_at
  before update on public.page_content_drafts
  for each row execute function public.set_updated_at();

create trigger page_seo_drafts_set_updated_at
  before update on public.page_seo_drafts
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;
alter table public.page_content_drafts enable row level security;
alter table public.page_seo_drafts enable row level security;
alter table public.page_revisions enable row level security;

create policy "Published pages are public"
  on public.pages for select
  to anon, authenticated
  using (true);

create policy "Admins manage content drafts"
  on public.page_content_drafts for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "SEO staff manage SEO drafts"
  on public.page_seo_drafts for all
  to authenticated
  using ((select public.can_edit_seo()))
  with check ((select public.can_edit_seo()));

create policy "Staff read revisions"
  on public.page_revisions for select
  to authenticated
  using ((select public.is_admin()) or (part = 'seo' and (select public.can_edit_seo())));

revoke all on public.pages, public.page_content_drafts, public.page_seo_drafts, public.page_revisions
  from anon, authenticated;
grant select on public.pages to anon, authenticated;
grant select, insert, update, delete on public.page_content_drafts, public.page_seo_drafts to authenticated;
grant select on public.page_revisions to authenticated;

-- ---------------------------------------------------------------------------
-- Publishing: the only way to change live pages. Copies draft -> live,
-- records a revision and clears the draft, all in one transaction.
-- ---------------------------------------------------------------------------
create or replace function public.publish_page(p_slug text, p_parts text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := public.staff_role();
  v_content jsonb;
  v_seo jsonb;
begin
  if v_role is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if 'content' = any (p_parts) then
    if v_role <> 'admin' then
      raise exception 'Only admins can publish page content' using errcode = '42501';
    end if;
    select content into v_content from public.page_content_drafts where slug = p_slug;
    if v_content is not null then
      insert into public.pages (slug, content, content_published_at, published_by, updated_at)
      values (p_slug, v_content, now(), auth.uid(), now())
      on conflict (slug) do update
        set content = excluded.content, content_published_at = now(), published_by = auth.uid(), updated_at = now();
      insert into public.page_revisions (slug, part, data, published_by) values (p_slug, 'content', v_content, auth.uid());
      delete from public.page_content_drafts where slug = p_slug;
    end if;
  end if;

  if 'seo' = any (p_parts) then
    select seo into v_seo from public.page_seo_drafts where slug = p_slug;
    if v_seo is not null then
      insert into public.pages (slug, seo, seo_published_at, published_by, updated_at)
      values (p_slug, v_seo, now(), auth.uid(), now())
      on conflict (slug) do update
        set seo = excluded.seo, seo_published_at = now(), published_by = auth.uid(), updated_at = now();
      insert into public.page_revisions (slug, part, data, published_by) values (p_slug, 'seo', v_seo, auth.uid());
      delete from public.page_seo_drafts where slug = p_slug;
    end if;
  end if;
end;
$$;

-- Loads an old revision back into the draft so it can be reviewed, then published.
create or replace function public.restore_page_revision(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := public.staff_role();
  v_rev record;
begin
  select slug, part, data into v_rev from public.page_revisions where id = p_id;
  if not found then
    raise exception 'Revision not found' using errcode = 'P0002';
  end if;
  if v_role is null or (v_rev.part = 'content' and v_role <> 'admin') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if v_rev.part = 'content' then
    insert into public.page_content_drafts (slug, content, updated_by) values (v_rev.slug, v_rev.data, auth.uid())
    on conflict (slug) do update set content = excluded.content, updated_by = auth.uid();
  else
    insert into public.page_seo_drafts (slug, seo, updated_by) values (v_rev.slug, v_rev.data, auth.uid())
    on conflict (slug) do update set seo = excluded.seo, updated_by = auth.uid();
  end if;
  return v_rev.slug;
end;
$$;

revoke all on function public.publish_page(text, text[]) from public, anon;
revoke all on function public.restore_page_revision(uuid) from public, anon;
grant execute on function public.publish_page(text, text[]) to authenticated;
grant execute on function public.restore_page_revision(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Blog posts: advanced SEO + an SEO-only update path for SEO editors
-- ---------------------------------------------------------------------------
alter table public.posts
  add column seo jsonb not null default '{}'::jsonb
    check (jsonb_typeof(seo) = 'object' and pg_column_size(seo) < 200000);

-- SEO editors need to see drafts too (to optimise them before launch); writes stay admin-only.
create policy "SEO editors can read all posts"
  on public.posts for select
  to authenticated
  using (public.can_edit_seo());

create or replace function public.update_post_seo(
  p_id uuid,
  p_meta_title text,
  p_meta_description text,
  p_meta_keywords text,
  p_seo jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_edit_seo() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.posts
     set meta_title = nullif(trim(p_meta_title), ''),
         meta_description = nullif(trim(p_meta_description), ''),
         meta_keywords = nullif(trim(p_meta_keywords), ''),
         seo = coalesce(p_seo, '{}'::jsonb)
   where id = p_id;
  if not found then
    raise exception 'Post not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_post_seo(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.update_post_seo(uuid, text, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Team management (admins only)
-- ---------------------------------------------------------------------------
create or replace function public.list_staff()
returns table (user_id uuid, email text, role text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return query
    select a.user_id, u.email::text, a.role, a.created_at, u.last_sign_in_at
      from public.admins a
      join auth.users u on u.id = a.user_id
     order by a.created_at;
end;
$$;

create or replace function public.add_staff(p_email text, p_role text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'seo_editor') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account uses that email yet. Create the user in Supabase Auth first.' using errcode = 'P0002';
  end if;
  insert into public.admins (user_id, role) values (v_user, p_role)
  on conflict (user_id) do update set role = excluded.role;
  return v_user;
end;
$$;

create or replace function public.set_staff_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'seo_editor') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;
  if p_user = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'You cannot remove your own admin access' using errcode = '22023';
  end if;
  update public.admins set role = p_role where user_id = p_user;
end;
$$;

create or replace function public.remove_staff(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_user = (select auth.uid()) then
    raise exception 'You cannot remove yourself' using errcode = '22023';
  end if;
  delete from public.admins where user_id = p_user;
end;
$$;

revoke all on function public.list_staff() from public, anon;
revoke all on function public.add_staff(text, text) from public, anon;
revoke all on function public.set_staff_role(uuid, text) from public, anon;
revoke all on function public.remove_staff(uuid) from public, anon;
grant execute on function public.list_staff() to authenticated;
grant execute on function public.add_staff(text, text) to authenticated;
grant execute on function public.set_staff_role(uuid, text) to authenticated;
grant execute on function public.remove_staff(uuid) to authenticated;
