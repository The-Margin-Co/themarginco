-- Video testimonials: a small, hand-curated set of client videos shown on the homepage
-- right after "Growth Architecture". Deliberately minimal — no SEO/rich-content surface
-- like posts/case studies, since there's no detail page for a video testimonial.

create table public.video_testimonials (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 2 and 80),
  role              text check (role is null or char_length(role) <= 60),
  company           text check (company is null or char_length(company) <= 60),
  video_url         text not null check (video_url ~ '^https?://'),
  poster_image      text not null check (poster_image ~ '^https?://'),
  poster_image_alt  text not null check (char_length(poster_image_alt) between 2 and 200),
  status            text not null default 'draft' check (status in ('draft', 'published')),
  published_at      timestamptz,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint video_testimonials_published_has_date check (status <> 'published' or published_at is not null)
);

create index video_testimonials_status_sort_idx on public.video_testimonials (status, sort_order, published_at desc);

create trigger video_testimonials_set_updated_at
  before update on public.video_testimonials
  for each row execute function public.set_updated_at();

alter table public.video_testimonials enable row level security;

create policy "Published video testimonials are publicly readable"
  on public.video_testimonials for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read all video testimonials"
  on public.video_testimonials for select
  to authenticated
  using ((select public.is_admin()));

-- No SEO-editor read-all policy here (unlike posts/case_studies): there's no meta_title,
-- meta_description or any other SEO surface on this table for can_edit_seo() to gate.

create policy "Admins can create video testimonials"
  on public.video_testimonials for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update video testimonials"
  on public.video_testimonials for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete video testimonials"
  on public.video_testimonials for delete
  to authenticated
  using ((select public.is_admin()));

revoke all on public.video_testimonials from anon, authenticated;
grant select on public.video_testimonials to anon, authenticated;
grant insert, update, delete on public.video_testimonials to authenticated;
