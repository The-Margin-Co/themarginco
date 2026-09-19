-- Blog CMS upgrade: SEO meta, featured image, draft/published workflow,
-- admin edit/delete, and a public `media` storage bucket for uploads.

-- ---------------------------------------------------------------------------
-- Posts: SEO + media + publishing columns
-- ---------------------------------------------------------------------------
alter table public.posts
  add column meta_title         text check (meta_title is null or char_length(meta_title) <= 70),
  add column meta_description   text check (meta_description is null or char_length(meta_description) <= 170),
  add column meta_keywords      text check (meta_keywords is null or char_length(meta_keywords) <= 255),
  add column featured_image     text check (featured_image is null or featured_image ~ '^https?://'),
  add column featured_image_alt text check (featured_image_alt is null or char_length(featured_image_alt) <= 200),
  add column status             text not null default 'published' check (status in ('draft', 'published')),
  add column published_at       timestamptz,
  add column updated_at         timestamptz not null default now();

-- Existing rows were live before this migration; new rows start as drafts.
update public.posts set published_at = created_at where published_at is null;
alter table public.posts alter column status set default 'draft';

alter table public.posts
  add constraint posts_published_has_date check (status <> 'published' or published_at is not null);

-- Drafts may be incomplete; published posts must meet the original content rules.
alter table public.posts
  drop constraint posts_excerpt_check,
  drop constraint posts_content_check,
  drop constraint posts_category_check,
  add constraint posts_excerpt_check
    check (char_length(excerpt) <= 300 and (status = 'draft' or char_length(excerpt) >= 10)),
  add constraint posts_content_check
    check (status = 'draft' or char_length(content) >= 50),
  add constraint posts_category_check
    check (char_length(category) <= 40 and (status = 'draft' or char_length(category) >= 2));

create index posts_status_published_idx on public.posts (status, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Posts: visitors see published posts only; admins manage everything
-- ---------------------------------------------------------------------------
drop policy "Posts are publicly readable" on public.posts;

create policy "Published posts are publicly readable"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read all posts"
  on public.posts for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update posts"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete posts"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));

grant update, delete on public.posts to authenticated;

-- ---------------------------------------------------------------------------
-- Media bucket: public read via CDN URL, admin-only writes (5 MB, images only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public objects are served via the public URL without a policy; this SELECT
-- policy lets admins' uploads return the inserted row (INSERT ... RETURNING).
create policy "Admins can read media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
