-- Self-hosted testimonial videos: their own bucket so the 5 MB image cap and image-only
-- MIME allowlist on `media` stay untouched. Browsers upload straight to Storage with a
-- server-issued signed URL (Vercel caps request bodies at ~4.5 MB), and the insert policy
-- below is what makes that signed URL admin-only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public reads come from the bucket's `public` flag; this SELECT policy is what lets an
-- admin's own upload return its row (INSERT ... RETURNING), same as the media bucket.
create policy "Admins can read videos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()));

create policy "Admins can upload videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos' and (select public.is_admin()));

create policy "Admins can update videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()))
  with check (bucket_id = 'videos' and (select public.is_admin()));

create policy "Admins can delete videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()));

-- Videos are now self-hosted, so the URL must point at our own bucket rather than any https URL.
alter table public.video_testimonials
  drop constraint video_testimonials_video_url_check,
  add constraint video_testimonials_video_url_check
    check (video_url ~ '^https?://' and video_url like '%/storage/v1/object/public/videos/%');
