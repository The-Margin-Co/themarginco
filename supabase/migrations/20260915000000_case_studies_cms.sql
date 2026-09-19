-- Case studies: a growing library of published results, mirroring the blog
-- (posts) table and its draft/publish + role split, plus a structured
-- `metrics` column for the headline-stat badges shown on cards and details.

create table public.case_studies (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null check (char_length(title) between 3 and 160),
  slug               text not null unique
                       check (char_length(slug) between 3 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt            text not null check (char_length(excerpt) <= 300 and (status = 'draft' or char_length(excerpt) >= 10)),
  content            text not null check (status = 'draft' or char_length(content) >= 50),
  industry           text not null check (char_length(industry) <= 40 and (status = 'draft' or char_length(industry) >= 2)),
  channels           text check (channels is null or char_length(channels) <= 80),
  metrics            jsonb not null default '[]'::jsonb
                       check (jsonb_typeof(metrics) = 'array' and pg_column_size(metrics) < 20000),
  status             text not null default 'draft' check (status in ('draft', 'published')),
  published_at       timestamptz,
  meta_title         text check (meta_title is null or char_length(meta_title) <= 70),
  meta_description   text check (meta_description is null or char_length(meta_description) <= 170),
  meta_keywords      text check (meta_keywords is null or char_length(meta_keywords) <= 255),
  featured_image     text check (featured_image is null or featured_image ~ '^https?://'),
  featured_image_alt text check (featured_image_alt is null or char_length(featured_image_alt) <= 200),
  seo                jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object' and pg_column_size(seo) < 200000),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint case_studies_published_has_date check (status <> 'published' or published_at is not null)
);

create index case_studies_status_published_idx on public.case_studies (status, published_at desc);

create trigger case_studies_set_updated_at
  before update on public.case_studies
  for each row execute function public.set_updated_at();

alter table public.case_studies enable row level security;

create policy "Published case studies are publicly readable"
  on public.case_studies for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read all case studies"
  on public.case_studies for select
  to authenticated
  using ((select public.is_admin()));

-- SEO editors read drafts too (to optimise them before launch), mirroring posts.
create policy "SEO editors can read all case studies"
  on public.case_studies for select
  to authenticated
  using (public.can_edit_seo());

create policy "Admins can create case studies"
  on public.case_studies for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update case studies"
  on public.case_studies for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete case studies"
  on public.case_studies for delete
  to authenticated
  using ((select public.is_admin()));

revoke all on public.case_studies from anon, authenticated;
grant select on public.case_studies to anon, authenticated;
grant insert, update, delete on public.case_studies to authenticated;

-- SEO-only update path for SEO editors, mirroring update_post_seo().
create or replace function public.update_case_study_seo(
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
  update public.case_studies
     set meta_title = nullif(trim(p_meta_title), ''),
         meta_description = nullif(trim(p_meta_description), ''),
         meta_keywords = nullif(trim(p_meta_keywords), ''),
         seo = coalesce(p_seo, '{}'::jsonb)
   where id = p_id;
  if not found then
    raise exception 'Case study not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_case_study_seo(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.update_case_study_seo(uuid, text, text, text, jsonb) to authenticated;
